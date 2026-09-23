#!/usr/bin/env bash
# Grounds the TDD skill in reality before any question is asked or any test is written.
# Reports repo location, git state (if any), the detected JS/TS test runner, and whether
# the existing suite is green. Scoped to JS/TS projects (expects a package.json).
set -euo pipefail

echo "== pwd =="
pwd

echo
echo "== git remote =="
if git rev-parse --git-dir >/dev/null 2>&1; then
  git remote -v || echo "(no remotes configured)"
else
  echo "not a git repository"
fi

echo
echo "== git branch =="
if git rev-parse --git-dir >/dev/null 2>&1; then
  git branch --show-current 2>/dev/null || echo "(detached HEAD or no commits yet)"
else
  echo "n/a (not a git repository)"
fi

echo
echo "== git status =="
if git rev-parse --git-dir >/dev/null 2>&1; then
  git status --short || true
else
  echo "n/a (not a git repository)"
fi

echo
echo "== package manager =="
if [ -f pnpm-lock.yaml ]; then
  PKG_MGR="pnpm"
elif [ -f yarn.lock ]; then
  PKG_MGR="yarn"
elif [ -f package-lock.json ]; then
  PKG_MGR="npm"
elif [ -f package.json ]; then
  PKG_MGR="npm"
else
  echo "HARD STOP: no package.json found in $(pwd). This skill is scoped to JS/TS projects."
  exit 1
fi
echo "$PKG_MGR (from lockfile/package.json present)"

echo
echo "== test runner =="
RUNNER=""
if grep -q '"vitest"' package.json 2>/dev/null; then
  RUNNER="vitest"
elif grep -q '"jest"' package.json 2>/dev/null; then
  RUNNER="jest"
elif grep -q '"mocha"' package.json 2>/dev/null; then
  RUNNER="mocha"
elif grep -qE '"test":\s*"node --test' package.json 2>/dev/null; then
  RUNNER="node --test"
else
  echo "Could not detect a known runner (jest/vitest/mocha/node --test) from package.json dependencies."
  echo "Falling back to whatever \"scripts\".\"test\" in package.json runs — inspect it by hand if the run below looks wrong."
  RUNNER="npm test --"
fi
echo "detected: $RUNNER"

echo
echo "== existing suite =="
SUITE_LOG="$(mktemp)"
trap 'rm -f "$SUITE_LOG"' EXIT

case "$RUNNER" in
  jest)      RUN_CMD="npx jest --watchAll=false" ;;
  vitest)    RUN_CMD="npx vitest run" ;;
  mocha)     RUN_CMD="npx mocha" ;;
  "node --test") RUN_CMD="node --test" ;;
  *)         RUN_CMD="npm test --" ;;
esac

if $RUN_CMD 2>&1 | tee "$SUITE_LOG"; then
  echo
  echo "Suite is GREEN. Safe to proceed."
else
  echo
  echo "HARD STOP: the existing suite is already RED, before any new test was added."
  echo "Do not write a new test or proceed with this card until the pre-existing failures"
  echo "are understood and either fixed or explicitly out of scope for this work."
  exit 1
fi

echo
echo "== verified single-test commands =="
case "$RUNNER" in
  jest)
    echo "By file:  npx jest <path/to/file>.test.js"
    echo "By name:  npx jest -t \"<test name>\""
    ;;
  vitest)
    echo "By file:  npx vitest run <path/to/file>.test.js"
    echo "By name:  npx vitest run -t \"<test name>\""
    ;;
  mocha)
    echo "By file:  npx mocha <path/to/file>.test.js"
    echo "By name:  npx mocha --grep \"<test name>\""
    ;;
  "node --test")
    echo "By file:  node --test <path/to/file>.test.js"
    echo "By name:  node --test --test-name-pattern=\"<test name>\""
    ;;
  *)
    echo "Runner not auto-detected — check package.json's \"scripts\".\"test\" and this runner's own"
    echo "docs for its single-file / single-name flags before relying on a guessed command."
    ;;
esac
echo "(confirm the exact runner/version against this project's package.json before trusting the above.)"

echo
echo "== test files present =="
find . -not -path '*/node_modules/*' -not -path '*/.git/*' \( -name '*.test.js' -o -name '*.test.ts' -o -name '*.spec.js' -o -name '*.spec.ts' \) 2>/dev/null | sort || echo "(no test files found by common naming patterns — check this project's actual test file glob)"

echo
echo "== CONTEXT.md =="
if [ -f CONTEXT.md ]; then
  echo "present — read it before naming seams."
else
  echo "absent — optional; a component-to-seam glossary can be built up here over repeated runs, but its absence isn't a blocker."
fi
