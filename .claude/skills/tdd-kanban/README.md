# tdd-kanban skill

A grilled, test-first loop driven by Kanban card content, for a team that currently writes code first and skips tests. Talks about **seams**, never "unit test" or "integration test."

Lives at `.claude/skills/tdd-kanban/` rather than `.claude/skills/tdd/` because `.claude/skills/tdd` is a symlink to the installed community skill at `.agents/skills/tdd` (`mattpocock/skills`, tracked in `skills-lock.json`) — this skill is a separate, larger loop, not a replacement for that one.

## Invoking it

Paste a card (story, bug, or task) and mention testing/TDD, or explicitly ask to work a card test-first. If you paste nothing, the skill asks for the card once and waits. Typo/copy/config-only changes are waved through without the loop — the skill says so and stops.

## The three modes

- **greenfield** — no code exists yet. Full 5-question grill, then red-green per slice.
- **retrofit (characterization)** — code already exists. Three sub-cases:
  - (a) written today for this card, test skipped → write the test, then `scripts/prove-test.sh` proves it actually catches a regression.
  - (b) old code the card changes → characterize current behavior first (pin it, don't fix it), then TDD the card's actual change on top.
  - (c) old code, coverage for its own sake, no card driving it → push back, recommend waiting.

  Always labeled `mode: retrofit (characterization)` — never reported as plain TDD.
- **bugfix** — reproduce, write a failing test at the seam where the wrongness is visible, fix, green. Short grill (~3 questions).

## Where the plan lands in the Kanban flow

```
refinement  →  In Progress                          →  PR review
   |              |                                        |
   |   grill.md produces templates/test-plan.md            |
   |   (agreed seams, slices, expected values +             |
   |    provenance) — this is what's built against          |
   |                                                         |
   |              the red-green loop runs here               |
   |              (modes/*.md)                                |
   |                                                         |
   +----------------------------------------→  templates/card-comment.md
                                                is pasted on the card:
                                                mode, seams, slice list as
                                                test names. Reviewers diff
                                                the actual test file's names
                                                against this list.
```

The test plan is the artifact refinement produces; the card comment is the artifact PR review checks against. If the two drift — a slice was added or dropped mid-loop without updating the comment — that's a signal the loop skipped a step, not that the comment needs a silent edit.

## Files

- `SKILL.md` — entry point: input → classify → ground → gate → grill → loop → emit → escape hatch.
- `grill.md` — the 5-question taxonomy (behavior, seam, reality, expected value, slice order) and round rules.
- `readiness.md` — the 6-item gate, all required before the first test.
- `seams.md` — what a seam is, ranking rules, presentation format for candidates.
- `mocking.md` — mock system boundaries only; this repo's actual and likely-future boundaries.
- `tests.md` — good vs. bad test examples in this repo's Jest + Supertest style.
- `modes/greenfield.md`, `modes/retrofit.md`, `modes/bugfix.md` — the three loops.
- `scripts/ground.sh`, `scripts/find-seam.sh`, `scripts/prove-test.sh` — fact-finding and verification, so the grill never asks the user something a script could answer.
- `templates/test-plan.md`, `templates/card-comment.md` — the two artifacts above.
