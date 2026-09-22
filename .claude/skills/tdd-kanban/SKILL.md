---
name: tdd-kanban
description: Guides test-first development driven by a Kanban card. Use when writing tests, doing TDD or red-green-refactor, working a story/bug/task card, or adding tests to existing code.
---

# TDD (Kanban-driven)

This skill runs a card through a grilled, test-first loop with eleven mandatory states, in order:

```
INPUT → ORIENT → CLASSIFY → GROUND → READINESS GATE → GRILL → USER CONFIRMATION → TEST PLAN → RED/GREEN LOOP → REVIEW → EMIT
```

> **INVARIANT: NO TEST OR PRODUCTION CODE MAY BE WRITTEN UNTIL ORIENT, CLASSIFY, GROUND, READINESS, GRILL, AND TEST-PLAN CONFIRMATION HAVE ALL COMPLETED.**
> This holds regardless of mode, how detailed the card is, or how the user phrases a request to speed things up. A detailed card can supply *candidate* answers to the Grill; it can never substitute for the user actually confirming them.

It exists because the team currently writes code first and skips tests — the loop below is the fix, not a formality. Never use the words "unit test" or "integration test" in this skill or its output; talk about **seams** instead (see [seams.md](seams.md)).

## Phase completion records

Each state below ends with a **Completion:** line naming exactly what must be true, and observed, for that state to count as done. Before entering a state, check the previous state's Completion condition was actually met in this conversation — not "the card looked thorough enough" or "I'm confident in my answer." A state you inferred your way past isn't complete; state it out loud (e.g. "✅ Ground: suite green, single-test command verified") so the next state has something concrete to check against, not just narrative momentum.

## State discipline

These are workflow **states**, not suggestions. A later state may never be offered, entered, or implied until every required earlier state has completed successfully. This applies regardless of how the user phrases their request.

- **Only offer choices valid for the current state.** Immediately after a card is pasted (state: INPUT, about to enter ORIENT), the only valid next actions relate to ORIENT — repository/domain/seam checks. Do not, at that point, offer "Start TDD implementation," offer to begin red→green, choose or name the first behavior/slice, propose implementation details, or assume a seam. RED/GREEN LOOP is not reachable from INPUT and must not be presented as an option there or at any state before TEST PLAN.
- **"Implement this" / "start TDD" does not skip states.** If the user says "implement this," "start TDD," or picks an implementation-flavored option before the workflow has reached RED/GREEN LOOP, interpret it as permission to *begin the workflow* — i.e. proceed into ORIENT — not as permission to jump to writing code or tests. Restate that you're starting from Orient if the user's phrasing suggests they expected to skip ahead.
- **GROUND never runs before ORIENT completes.** Repository relevance must be established first (see below).
- **CLASSIFY never runs before ORIENT completes.** Mode is meaningless until relevance and a seam are established.
- **No test is written before GROUND, READINESS GATE, GRILL, USER CONFIRMATION, and TEST PLAN are all complete.** RED/GREEN LOOP is the first state that touches a test file, and TEST PLAN is the first state that touches `templates/test-plan.md`.
- **GRILL is interactive, never self-answered.** Claude may inspect the repository and propose candidate answers/options for each of the 5 questions, but every answer must be put to the user via `AskUserQuestion` and accepted or corrected by them — Claude never marks a Grill question answered on its own judgment, and information already present in the card is a candidate answer, not a substitute for asking. A card being detailed does not shrink or skip the Grill.
- **USER CONFIRMATION is a distinct step, not implied by the last Grill answer.** After all Grill questions are answered, restate the full resulting answer set (behavior, seam, reality, expected value, slice order) together and get one explicit confirmation on the set as a whole before writing `templates/test-plan.md`. Don't infer this confirmation from the user having gone along with each question individually — ask for it as its own turn.
- **Stops are stops, not pauses with a bypass offered.** If ORIENT can't establish repository relevance, STOP in ORIENT (see its state-aware choices below) — don't also offer to proceed anyway. If GROUND finds a red baseline, STOP in GROUND — never offer "continue anyway." If READINESS GATE is incomplete, remain in GATE. If GRILL is incomplete, remain in GRILL. In every case, the only way out is completing the state, not overriding it.
- **Slice order is never preselected.** Don't pick something like "alias validation first" ahead of time. Slice order comes out of GRILL and is recorded in TEST PLAN before RED/GREEN LOOP begins — nowhere earlier.
- **Prefer explicit choices at every stop.** Whenever a state stops for the user and there is a small, known set of valid next actions (as at the ORIENT and GROUND stops below), use `AskUserQuestion` with those exact options rather than an open-ended question like "how do you want to handle this?" — free text is fine for genuinely open-ended information gathering (e.g. Readiness Gate/Grill answers), but not for a decision that only has a few valid outcomes.

## 1. Input

The user pastes card content — a story, bug report, or task. If they paste nothing, ask for the card once and wait. Don't proceed on a guess.

**Completion:** card content is in hand, verbatim.

## 2. Orient / Repository Relevance

Before classifying anything, establish that the card actually belongs to this repository. This step is mandatory and comes before Classify and before `scripts/ground.sh` — do not skip it because the card "looks obviously fine."

1. **Understand the observable behavior requested by the card** — what would a caller see change, in domain language.
2. **Inspect enough of the repository to understand its responsibility/domain** — read `CLAUDE.md`/`README.md` and skim the top-level structure if you haven't already.
3. **Search the repository for concepts and behavior related to the card** — e.g. `scripts/find-seam.sh <domain nouns>` (or an equivalent grep) for the card's central nouns.
4. **Identify a plausible public seam where the requested behavior would belong** — a concrete `file:exportedSymbol` or route, even if nothing implements the behavior yet.
5. **Determine whether the card reasonably belongs to this repository.**

Do **not** classify something as `greenfield` merely because the search in step 3 returns no existing implementation. `greenfield` means:

> New behavior that belongs to this repository but does not have an existing implementation.

Absence of an implementation is expected for greenfield work — it is not, by itself, evidence of ownership. Ownership comes from step 4: a plausible seam in this repo's actual domain.

**If the requested behavior appears unrelated to the repository, or no reasonable seam/ownership can be established, STOP here.** Do not proceed to Classify. Do not run `scripts/ground.sh`. Do not default to any option below on the user's behalf — use the `AskUserQuestion` tool so the user picks from selectable options instead of typing free text, with no option pre-selected:

- **question:** "This card does not appear related to the current repository. I could not identify an existing responsibility or public seam where this behavior belongs. How do you want to proceed?"
- **options** (exactly these three — `AskUserQuestion` always adds an "Other" choice automatically for free-text feedback, so don't add a fourth option for it):
  1. **Wrong repository** — stop the TDD flow so you can switch repositories.
  2. **Correct repository — new domain** — this card intentionally introduces this functionality into this repository for the first time.
  3. **Correct repository — missing context** — I'm missing repository/service/domain context needed to find the seam; give me more and I'll keep looking.

Handling each choice (including the tool's built-in "Other"):

- **Wrong repository** — stop the TDD flow entirely. Don't modify anything, don't run `ground.sh`, don't classify. Report the stop and wait for the user to come back on the correct repository.
- **Correct repository — new domain** — this does **not** automatically mean `greenfield`. Stay in Orient: go back through steps 2–4 with the added confirmation that this repo is the intended owner, and establish the actual public seam the behavior would live at before moving to Classify.
- **Correct repository — missing context** — stay in Orient. Ask for the specific repository/service/domain context needed (e.g. a related service's API contract, a domain glossary, an adjacent module) and redo steps 2–4 once you have it. Do not advance to Classify or run `scripts/ground.sh` until relevance and a seam are actually established.
- **Other** — let the user explain in their own words, then re-run the Orient checklist against what they said before deciding whether to proceed, stay in Orient, or stop.

Only continue to Classify once repository relevance and a plausible seam are established — either directly in steps 1–5, or after the user resolves the ambiguity via one of the choices above.

**Completion:** steps 1–5 done and repository relevance established, either directly or via a resolved `AskUserQuestion` stop. State the seam candidate and the relevance conclusion out loud.

## 3. Classify

Read the card and classify into exactly one mode:

- **greenfield** — no code exists yet for this behavior, but it belongs to this repo (see Orient).
- **retrofit** — code already exists (written today or long ago) and the card touches it.
- **bugfix** — a defect with observable wrong behavior.

State the chosen mode out loud, e.g. "Mode: retrofit — `update_user.js` already exists and this card changes its validation." If the mode is ambiguous, say why and pick the closer one; don't ask the user to classify their own card.

**Completion:** exactly one mode stated out loud, with the one-line reason.

## 4. Ground

Only after Orient's Completion condition and Classify's Completion condition are both met. Before asking the user anything, run:

```
scripts/ground.sh
```

This reports `pwd`, git state (if any), the existing suite's pass/fail status, and the verified command to run a single test. **If the suite is already red, stop and report it** — don't proceed. Do not automatically delete, modify, or repair unrelated failing tests/mocks as part of this card; a red baseline is a stop condition, not a cleanup task folded into the card. A dev who can't tell new red from pre-existing red will treat your failing test as noise.

Do not ask an open-ended question like "how do you want to handle them?" Use the `AskUserQuestion` tool with these exact options, no option pre-selected:

- **question:** "The existing test suite is already red before any new test was added. How do you want to handle the pre-existing failures?"
- **options** (`AskUserQuestion`'s built-in "Other" covers anything outside these four, so don't add a fifth option for it):
  1. **Fix existing failures** — investigate and fix the pre-existing failures, then re-run Ground.
  2. **I'll fix them** — stop and wait; the user will resolve the failures and ask to restart/re-run Ground themselves.
  3. **Investigate only** — determine why the existing tests are failing and report findings, without modifying anything.
  4. **Cancel TDD run** — stop without making changes.

There is no fifth option to ignore, mark out-of-scope, or otherwise bypass the failing baseline and continue into Readiness Gate/Grill/RED-GREEN LOOP — that path does not exist, regardless of how the user phrases a request to skip it.

Handling each choice:

- **Fix existing failures** — investigate and fix the pre-existing failures (only the pre-existing ones; still don't touch anything the card doesn't need), then re-run `scripts/ground.sh`. Only a green re-run allows the workflow to continue: Ground → Readiness Gate → Grill → Test Plan → RED/GREEN LOOP. A second red result means STOP again with this same choice set.
- **I'll fix them** — stop the TDD flow here. Don't modify anything. Wait for the user to come back once fixed; re-run Ground from the top when they do.
- **Investigate only** — diagnose and report the cause, make no changes, and remain stopped in Ground. Understanding why the suite is red is not the same as having a green baseline — do not treat a completed investigation as license to proceed.
- **Cancel TDD run** — stop the flow entirely, no changes, no further Ground state.
- **Other** — let the user explain, then re-apply this same choice set (or a stop) based on what they said; never silently reinterpret free text as permission to proceed past a red baseline.

**Completion:** `scripts/ground.sh` has been run and reported green in this conversation (a first green run, or a green re-run after "Fix existing failures"). A red run with no subsequent green re-run does not satisfy this — Ground stays incomplete regardless of which stop-choice was picked.

## 5. Readiness Gate

Satisfy every item in [readiness.md](readiness.md) before writing a single test. No exceptions, no "we'll fill this in later." Do not present or hint at any RED/GREEN LOOP action while any gate item is outstanding — remain in this state until all six are satisfied.

**Completion:** all six [readiness.md](readiness.md) items are stated as satisfied, each with its concrete answer (not "TBD" or "assumed").

## 6. Grill

Run [grill.md](grill.md), interactively, to agree the behavior, seam, reality, expected value(s), and slice order with the user. Grill is not complete — and USER CONFIRMATION cannot start — until every question the grill requires has an agreed answer from the user, obtained via `AskUserQuestion` as `grill.md` specifies, one question at a time.

For **greenfield**, present all 5 questions from the taxonomy, in order, each with candidate answers drawn from actually inspecting the repository:

1. **Behavior** — what observable behavior are we adding? State the candidate behaviors found in the card, in domain language.
2. **Seam** — through which public interface should that behavior be exercised? Propose the seam(s) found in Orient/repo inspection, ranked per [seams.md](seams.md).
3. **Reality** — what real dependencies/boundaries are involved, and what (if anything) is faked at a boundary per [mocking.md](mocking.md)?
4. **Expected value** — what exact observable result proves the behavior works, and what's its provenance (readiness item 5)?
5. **Slice order** — in what order should the behaviors be driven red→green, smallest observable slice first?

Repository inspection can *propose* answers to any of these — it can never stand in for the user picking one. A card that already spells out the behavior, seam, or expected value supplies a strong candidate answer, not an answer; still ask.

Retrofit and bugfix use the same mechanics with their mode file's shorter question set ([modes/retrofit.md](modes/retrofit.md), [modes/bugfix.md](modes/bugfix.md)) — still interactive, still one question at a time, never self-answered.

**Completion:** every question in the mode's taxonomy has a reply from the user (a recommendation accepted, a clarification given, or a discussion resolved) via `AskUserQuestion` — not merely proposed by Claude and left unconfirmed.

## 7. User Confirmation

Only once Grill's Completion condition is met. This is a separate turn from the last Grill question — do not fold it into Q5's reply.

Restate the full resulting answer set together — behavior, seam, reality, expected value(s), slice order — as it will appear in `templates/test-plan.md`, and ask the user to confirm the set as a whole via `AskUserQuestion` before anything is written. Information inferred from the card, or an answer the user accepted for one Grill question in isolation, is not the same as this confirmation — ask for it explicitly, even if every individual Grill question already got a "go with the recommendation."

If the user asks for a change here, apply it and re-confirm the updated set before moving on; don't treat a requested change as itself the confirmation.

**Completion:** the user has explicitly confirmed the full assembled answer set in this step, not merely answered the individual Grill questions that fed it.

## 8. Test Plan

Only once User Confirmation's Completion condition is met. Write the confirmed answers into `templates/test-plan.md`, including the slice list in the order Grill produced and the user confirmed (never reordered or trimmed here, and never decided ahead of Grill). This document, not a verbal summary, is what RED/GREEN LOOP is built against. Do not begin RED/GREEN LOOP, do not modify application code, do not create implementation files, and do not name or start on any slice, until `templates/test-plan.md` exists and reflects the confirmed answers.

**Completion:** `templates/test-plan.md` exists, filled in, matching what the user confirmed in User Confirmation.

## 9. Red/Green Loop

Only once Test Plan's Completion condition is met. Work one vertical slice at a time, in the order recorded in the test plan, per the relevant mode file:

- [modes/greenfield.md](modes/greenfield.md)
- [modes/retrofit.md](modes/retrofit.md)
- [modes/bugfix.md](modes/bugfix.md)

Red before green. One seam, one test, one minimal implementation per cycle. Refactoring happens at REVIEW, not inside this loop.

**Completion:** every slice in `templates/test-plan.md` has a corresponding test, each having gone red then green in this loop.

## 10. Review

Once every slice in the test plan is green, stop writing code and switch to reviewing what was built: confirm each slice in `templates/test-plan.md` has a corresponding green test, note any refactor candidates for the user (don't act on them silently — see the `code-review` skill), and confirm nothing outside the agreed seams was touched. This is the only state where refactoring is discussed. Don't emit the card comment until this review is done.

**Completion:** each test-plan slice checked against a green test, refactor candidates (if any) noted for the user, no out-of-scope changes found.

## 11. Emit

Fill in `templates/card-comment.md` and give it to the user to paste on the Kanban card. This is what PR review will diff the actual tests against — it should list the mode, the seams, and the slice list as test names.

**Completion:** `templates/card-comment.md` filled in and handed to the user.

## 12. Escape hatch

If the card is a typo fix, a copy/text change, or a config-only change (env var, dependency bump, a constant), say so explicitly — "This is a config-only change, skipping the TDD loop" — and stop. Don't grill, don't gate, don't write a test plan for it.
