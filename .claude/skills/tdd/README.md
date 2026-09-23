# tdd skill

A grilled, test-first loop driven by a card (story, bug, or task), for a team that currently writes code first and skips tests. Talks about **seams**, never "unit test" or "integration test." Scoped to **JavaScript/TypeScript** projects — see the "Scope" note in `SKILL.md`.

## Invoking it

Paste a card and mention testing/TDD, or explicitly ask to work a card test-first. If you paste nothing, the skill asks for the card once and waits. Typo/copy/config-only changes are waved through without the loop — the skill says so and stops.

Before classifying, the skill orients itself: it checks that the card's behavior plausibly belongs to the repository it's running against (a real domain concept, a plausible public seam) before deciding greenfield/retrofit/bugfix. No existing implementation for a behavior is not evidence the card is greenfield — it could just as easily mean the card belongs to a different repository. If relevance can't be established, the skill stops in Orient and presents state-aware choices (wrong repository / correct repository — new domain / correct repository — missing context) via `AskUserQuestion`, instead of guessing or offering to proceed anyway.

The skill enforces eleven mandatory states in order — `INPUT → ORIENT → CLASSIFY → GROUND → READINESS GATE → GRILL → USER CONFIRMATION → TEST PLAN → RED/GREEN LOOP → REVIEW → EMIT` — and never skips ahead. Even "implement this" or "start TDD" right after a card is pasted is treated as permission to begin the workflow (from Orient), not as permission to jump straight to writing code or tests. Whatever slice gets worked first is whatever Grill and the recorded test plan say, never a guess made up front.

Grill is interactive by design: Claude inspects the target repo and proposes candidate answers to the 5-question taxonomy, but every answer is confirmed by the user via `AskUserQuestion`, one question at a time — a detailed card supplies candidates, not answers. Once all questions are answered, the skill restates the whole answer set (behavior, seam, reality, expected value, slice order) and asks for one explicit confirmation on the set as a whole before `templates/test-plan.md` is written — that confirmation is its own step, not inferred from having gone along with the individual questions. No test or production code is written before Orient, Classify, Ground, Readiness Gate, Grill, and that test-plan confirmation have all completed.

Nothing about the target repo is assumed in advance — language runtime aside (JS/TS), the skill discovers the package manager, test runner, existing test-naming convention, and seam candidates from the repo itself (`scripts/ground.sh`, `scripts/find-seam.sh`) rather than hardcoding any of it.

## The three modes

- **greenfield** — no code exists yet, but the behavior belongs to this repo (established in Orient). Full 5-question grill, then red-green per slice.
- **retrofit (characterization)** — code already exists. Three sub-cases:
  - (a) written today for this card, test skipped → write the test, then `scripts/prove-test.sh` proves it actually catches a regression.
  - (b) old code the card changes → characterize current behavior first (pin it, don't fix it), then TDD the card's actual change on top.
  - (c) old code, coverage for its own sake, no card driving it → push back, recommend waiting.

  Always labeled `mode: retrofit (characterization)` — never reported as plain TDD.
- **bugfix** — reproduce, write a failing test at the seam where the wrongness is visible, fix, green. Short grill (~3 questions).

## Where the plan lands in the workflow

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

- `SKILL.md` — entry point and state machine: input → orient (repository relevance) → classify → ground → readiness gate → grill → user confirmation → test plan → red/green loop → review → emit → escape hatch. States are mandatory, each carries a stated completion condition the next state checks, and none can be skipped forward.
- `grill.md` — the 5-question taxonomy (behavior, seam, reality, expected value, slice order) and round rules.
- `readiness.md` — the 6-item gate, all required before the first test.
- `seams.md` — what a seam is, ranking rules, presentation format for candidates.
- `mocking.md` — mock system boundaries only; how to discover or set up a mocking convention in the target repo.
- `tests.md` — good vs. bad test patterns, with illustrative (Jest-flavored, swap as needed) examples.
- `modes/greenfield.md`, `modes/retrofit.md`, `modes/bugfix.md` — the three loops.
- `scripts/ground.sh`, `scripts/find-seam.sh`, `scripts/prove-test.sh` — fact-finding and verification, so the grill never asks the user something a script could answer. Detect the target repo's package manager/test runner rather than assuming one.
- `templates/test-plan.md`, `templates/card-comment.md` — blank templates for the two artifacts above.
