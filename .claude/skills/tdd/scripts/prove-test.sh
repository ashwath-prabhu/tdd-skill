#!/usr/bin/env bash
# Proves a test actually tests something: mutate the source, confirm the test goes red,
# restore, confirm it goes green again. Required for retrofit case (a) — a test written
# against code that already exists, where "it passed" alone proves nothing.
#
# Scoped to JS/TS projects. Mutation heuristics are JS-shaped (===/return statements) —
# this deliberately doesn't try to be a general-purpose mutation testing tool, just a
# blunt "does the test notice any change to the logic" check.
#
# Usage: prove-test.sh <test-file> <source-file>
#   prove-test.sh __tests__/create_user.test.js routes/create_user.js
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: prove-test.sh <test-file> <source-file>" >&2
  exit 1
fi

TEST_FILE="$1"
SOURCE_FILE="$2"

if grep -q '"vitest"' package.json 2>/dev/null; then
  TEST_CMD=(npx vitest run "$TEST_FILE")
elif grep -q '"jest"' package.json 2>/dev/null; then
  TEST_CMD=(npx jest "$TEST_FILE")
elif grep -q '"mocha"' package.json 2>/dev/null; then
  TEST_CMD=(npx mocha "$TEST_FILE")
else
  echo "Could not detect jest/vitest/mocha from package.json — defaulting to 'npx jest'." >&2
  TEST_CMD=(npx jest "$TEST_FILE")
fi

for f in "$TEST_FILE" "$SOURCE_FILE"; do
  if [ ! -f "$f" ]; then
    echo "HARD STOP: $f does not exist." >&2
    exit 1
  fi
done

BACKUP="$(mktemp)"
cp "$SOURCE_FILE" "$BACKUP"
restore() {
  cp "$BACKUP" "$SOURCE_FILE"
  rm -f "$BACKUP"
}
trap restore EXIT

echo "== baseline: test should currently be GREEN =="
if ! "${TEST_CMD[@]}" 2>&1; then
  echo "HARD STOP: $TEST_FILE is not green before mutation — fix the test first, this script"
  echo "proves a currently-passing test would catch a regression, not a currently-failing one."
  exit 1
fi

echo
echo "== mutating $SOURCE_FILE =="
# First mutation that changes a line wins: invert a boolean/comparison, or force an early
# return of a constant. This is deliberately blunt — the goal is "does the test notice any
# change to the logic," not a specific mutation testing framework.
if grep -q '===' "$SOURCE_FILE"; then
  sed -i.bak '0,/===/{s/===/!==/}' "$SOURCE_FILE"
  echo "inverted the first '===' to '!=='"
elif grep -qE 'return res\.status\([0-9]+\)' "$SOURCE_FILE"; then
  sed -i.bak '0,/return res\.status([0-9]*)/{s/return res\.status([0-9]*)/return res.status(599)/}' "$SOURCE_FILE"
  echo "forced the first status code to 599"
elif grep -qE '^\s*return ' "$SOURCE_FILE"; then
  sed -i.bak '0,/^\s*return /{s/^\(\s*\)return .*/\1return undefined;/}' "$SOURCE_FILE"
  echo "forced the first return to 'undefined'"
else
  echo "HARD STOP: couldn't find a mutable comparison or return in $SOURCE_FILE — mutate it"
  echo "by hand and re-run this script, or pick a different source file."
  exit 1
fi
rm -f "${SOURCE_FILE}.bak"

echo
echo "== mutated: test should now be RED =="
if "${TEST_CMD[@]}" 2>&1; then
  echo
  echo "HARD STOP: the test stayed GREEN with the logic gutted. It is not testing the behavior"
  echo "it claims to — strengthen the assertion before trusting this test."
  exit 1
fi
echo "confirmed red — the test does notice the mutation."

echo
echo "== restoring $SOURCE_FILE =="
restore
trap - EXIT

echo
echo "== restored: test should be GREEN again =="
if ! "${TEST_CMD[@]}" 2>&1; then
  echo "HARD STOP: restore did not bring the test back to green — check $SOURCE_FILE by hand." >&2
  exit 1
fi

echo
echo "PASS: $TEST_FILE goes red when $SOURCE_FILE's logic breaks, and green when it's intact."
