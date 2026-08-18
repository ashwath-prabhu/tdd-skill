---
name: tdd-kanban
description: Guides test-first development driven by a Kanban card. Use when writing tests, doing TDD or red-green-refactor, working a story/bug/task card, or adding tests to existing code.
---

# TDD (Kanban-driven)

This skill runs a card through a grilled, test-first loop. It exists because the team currently writes code first and skips tests — the loop below is the fix, not a formality. Never use the words "unit test" or "integration test" in this skill or its output; talk about **seams** instead (see [seams.md](seams.md)).

## 1. Input

The user pastes card content — a story, bug report, or task. If they paste nothing, ask for the card once and wait. Don't proceed on a guess.

## 2. Classify

Read the card and classify into exactly one mode:

- **greenfield** — no code exists yet for this behavior.
- **retrofit** — code already exists (written today or long ago) and the card touches it.
- **bugfix** — a defect with observable wrong behavior.

State the chosen mode out loud, e.g. "Mode: retrofit — `update_user.js` already exists and this card changes its validation." If the mode is ambiguous, say why and pick the closer one; don't ask the user to classify their own card.

## 3. Ground

Before asking the user anything, run:

```
scripts/ground.sh
```

This reports `pwd`, git state (if any), the existing suite's pass/fail status, and the verified command to run a single test. **If the suite is already red, stop and report it** — don't proceed. A dev who can't tell new red from pre-existing red will treat your failing test as noise.

## 4. Gate

Satisfy every item in [readiness.md](readiness.md) before writing a single test. No exceptions, no "we'll fill this in later."

## 5. Grill

Run [grill.md](grill.md). Output `templates/test-plan.md` filled in with the agreed answers.

## 6. Loop

Work one vertical slice at a time, per the relevant mode file:

- [modes/greenfield.md](modes/greenfield.md)
- [modes/retrofit.md](modes/retrofit.md)
- [modes/bugfix.md](modes/bugfix.md)

Red before green. One seam, one test, one minimal implementation per cycle. Refactoring happens at review time, not inside this loop.

## 7. Emit

Fill in `templates/card-comment.md` and give it to the user to paste on the Kanban card. This is what PR review will diff the actual tests against — it should list the mode, the seams, and the slice list as test names.

## 8. Escape hatch

If the card is a typo fix, a copy/text change, or a config-only change (env var, dependency bump, a constant), say so explicitly — "This is a config-only change, skipping the TDD loop" — and stop. Don't grill, don't gate, don't write a test plan for it.
