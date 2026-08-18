#!/usr/bin/env bash
# Finds candidate seams for a card, given a ticket id and/or domain nouns.
# Usage: find-seam.sh [-t TICKET_ID] [noun ...]
#   find-seam.sh -t PROJ-123 register password
#   find-seam.sh checkout cart
set -euo pipefail

TICKET_ID=""
if [ "${1:-}" = "-t" ]; then
  TICKET_ID="${2:-}"
  shift 2 || true
fi
NOUNS=("$@")

IS_GIT_REPO=false
if git rev-parse --git-dir >/dev/null 2>&1; then
  IS_GIT_REPO=true
fi

if [ -n "$TICKET_ID" ]; then
  echo "== matching branch for $TICKET_ID =="
  if [ "$IS_GIT_REPO" = true ]; then
    git branch --all 2>/dev/null | grep -i "$TICKET_ID" || echo "(no branch name contains $TICKET_ID)"
  else
    echo "n/a (not a git repository)"
  fi

  echo
  echo "== commits mentioning $TICKET_ID =="
  if [ "$IS_GIT_REPO" = true ]; then
    git log --oneline --grep="$TICKET_ID" 2>/dev/null || echo "(no commits found)"
  else
    echo "n/a (not a git repository)"
  fi

  echo
  echo "== diff vs base (branch changes) =="
  if [ "$IS_GIT_REPO" = true ]; then
    BASE_BRANCH="$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || true)"
    BASE_BRANCH="${BASE_BRANCH:-main}"
    git diff --stat "${BASE_BRANCH}...HEAD" 2>/dev/null || echo "(no diff against ${BASE_BRANCH}, or branch not found)"
  else
    echo "n/a (not a git repository)"
  fi
fi

echo
echo "== uncommitted changes =="
if [ "$IS_GIT_REPO" = true ]; then
  git status --short 2>/dev/null || echo "(none)"
else
  echo "n/a (not a git repository)"
fi

if [ "${#NOUNS[@]}" -eq 0 ]; then
  echo
  echo "No domain nouns given — pass the card's central nouns (e.g. 'register', 'password', 'checkout') to search the tree."
  exit 0
fi

echo
echo "== grepping repo for domain nouns: ${NOUNS[*]} =="
HITS_FOUND=false
for NOUN in "${NOUNS[@]}"; do
  echo
  echo "-- '$NOUN' --"
  MATCHES="$(grep -ril --exclude-dir=node_modules --exclude-dir=.git "$NOUN" . 2>/dev/null || true)"
  if [ -n "$MATCHES" ]; then
    HITS_FOUND=true
    echo "$MATCHES"
  else
    echo "(no matches)"
  fi
done

if [ "$HITS_FOUND" = false ]; then
  echo
  echo "WRONG-REPO WARNING: none of the given domain nouns (${NOUNS[*]}) appear anywhere in this"
  echo "repository (excluding node_modules/.git). Before proceeding, confirm this is the right"
  echo "repo/package for this card — see CONTEXT.md's component -> repo mapping, or ask the user"
  echo "once and persist the answer there."
  exit 1
fi

echo
echo "== ranked candidates =="
echo "Rank by: outermost observable boundary first, exported symbols over internals,"
echo "and any file that also appeared in the uncommitted/branch diff above is strong evidence."
