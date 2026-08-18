#!/usr/bin/env bash
# Grounds the TDD skill in reality before any question is asked or any test is written.
# Reports repo location, git state (if any), and whether the existing Jest suite is green.
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
echo "== existing suite =="
SUITE_LOG="$(mktemp)"
trap 'rm -f "$SUITE_LOG"' EXIT

if npx jest 2>&1 | tee "$SUITE_LOG"; then
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
echo "By file:  npx jest __tests__/<file>.test.js"
echo "By name:  npx jest -t \"<test name>\""
echo "(both confirmed against this repo's package.json: devDependencies include jest ^30 and supertest ^7;"
echo " 'npm test' runs 'jest --watchAll' — avoid it in this non-interactive loop, use 'npx jest' directly.)"

echo
echo "== test files present =="
find __tests__ -name '*.test.js' 2>/dev/null | sort || echo "(no __tests__ directory found)"

echo
echo "== CONTEXT.md =="
if [ -f CONTEXT.md ]; then
  echo "present — read it before naming seams."
else
  echo "absent — the skill should create one on first run (see the skill's Repo memory step)."
fi
