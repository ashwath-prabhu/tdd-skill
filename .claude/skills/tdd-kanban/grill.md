# Grill

A bounded interview that produces `templates/test-plan.md`. The point isn't to interrogate for its own sake — it's to make sure every decision that changes which test gets written next has actually been made, out loud, before any test exists.

## Question order

Ask in this order because each round can depend on the answer to the round before it — a question whose answer depends on an open question belongs to a **later** round, not this one:

1. **Behavior** — What can a caller do that they couldn't before? State it in domain language, lifted from the card (e.g. "a registrant can create an account with a first name" — not "the router returns 201").
2. **Seam** — Which public boundary is that observable at? (See [seams.md](seams.md).) e.g. `POST /register` via `request(app)`, or `password_checker.js:checkPasswordStrength` via a direct `require`.
3. **Reality** — What's real in the test, what's faked? Only system boundaries get faked (see [mocking.md](mocking.md)) — e.g. "real Express app, real in-memory `users` store, no external calls to fake."
4. **Expected value** — What exactly comes out, **and where did that value come from?** (See readiness item 5 — provenance is mandatory.)
5. **Slice order** — Which tracer bullet goes first? Smallest observable slice that proves the seam wired correctly, not the whole feature at once. Name each slice as the literal string that will go inside `test(...)`, in this repo's convention: **`should <expected outcome> when <condition>`** — start with "should", state the observable result (status code and/or shape) before the triggering condition. Not a paraphrase, and not prefixed with the `describe(...)` block's title (that context is already implied by nesting) — e.g. `should return 200 with an empty envelope when no users exist`, not `returns an empty envelope when no users exist` or `GET /users returns an empty envelope when no users exist`. Both `templates/test-plan.md`'s Slices section and `templates/card-comment.md`'s slice list must carry this exact string, so a reviewer can diff the plan against the real test file without translating.

## Rules

- **"Round" is a dependency batch, not a delivery batch.** The frontier — every question whose answer doesn't depend on a still-open question — is computed one round at a time, per Question order above. But ask the questions *within* that frontier **one at a time**, in order, waiting for a reply before asking the next. Don't dump a numbered list and wait once — that's a form, not a conversation.
- Every question carries a recommended answer with a half-sentence of *why*. The `➡️` line is the team's training programme in miniature — it has to teach the reasoning, not just hand over a decision.
- **Every question ends with the same three replies on offer**, via `AskUserQuestion`:
  1. **Go with the recommendation** — accepts the `➡️` line, moves straight to the next question.
  2. **Let me clarify** — the user has their own answer; take it and move on.
  3. **Let's chat about it** — open a short back-and-forth on *this question only* before either of you locks in an answer; once resolved, move to the next question.
- Format, exactly — one question per turn:

```
❓ **Q1** - **<title>**: <body, may include ranked choices with evidence>

➡️ <recommendation + why>
```
followed by an `AskUserQuestion` call with options `Go with the recommendation (Recommended)` / `Let me clarify` / `Let's chat about it`.

- **"Go with your recommendations," said once, applies to every question still open** — not just the current one. If the user says it at Q1, don't re-ask Q2–Q5 one-by-one for the same confirmation; treat the rest of the round (and any later rounds) as accepted and move straight to the plan, naming each accepted recommendation as you go.
- Round budget: **max 2 rounds for a bug, 3 for a story**. If you're not converged by then, take your own recommendations and say so.
- If an answer wouldn't change which test gets written next, it's not a frontier question — drop it.
- **Facts are never asked of the user.** Anything discoverable — does this file exist, what does the test runner print, what branch are we on — is dispatched to `scripts/ground.sh` or `scripts/find-seam.sh`, not asked. Only ask about **decisions**: what should happen, what's in scope, what's the right seam among candidates.
- **Question 4 (expected value) is mandatory and never skipped.** If the answer is "whatever the function returns" or "I'll run it and see," that's a forming tautological test (readiness item 5 / provenance). Name it as such and re-ask — don't accept it and move on.

## Worked example — round 1, on this repo

Card: *"As a user, I want `checkPasswordStrength` to return `'strong'` for passwords of 12+ characters that mix case and digits, so the register endpoint can reject weak passwords."*

Turn 1 — only Q1 is shown, then the tool call:

```
❓ **Q1** - **Behavior**: What can a caller do that they couldn't before? Candidates:
  1. `checkPasswordStrength` classifies any password into weak/medium/strong (broad).
  2. `checkPasswordStrength` additionally recognizes a 'strong' tier for 12+ chars with mixed case and digits (narrow, matches the card).

➡️ Go with (2) — the card only asks for the strong tier; today the function returns `undefined` for anything ≥8 chars, so widening scope beyond what's asked risks building the medium tier on a guess.
```
→ `AskUserQuestion(["Go with the recommendation (Recommended)", "Let me clarify", "Let's chat about it"])`

Say the user picks **Go with the recommendation**. Turn 2 — only Q2:

```
❓ **Q2** - **Seam**: `password_checker.js:checkPasswordStrength`, called directly (as `__tests__/password_checker.test.js` already does), or through `POST /register`?

➡️ `password_checker.js:checkPasswordStrength` directly — it's the outermost boundary where this specific behavior is observable; `register.js` doesn't call it yet, so testing through the route would be testing code that doesn't exist.
```
→ same three-option ask.

This continues one at a time through Q3 (Reality), Q4 (Expected value — `'strong'` for `'Abcdef123456'`, provenance = card literal), and Q5 (Slice order — one slice, nothing smaller to split off). If the user instead says **"go with your recommendations"** at any point, stop asking one-by-one and go straight to the plan: seam `password_checker.js:checkPasswordStrength`, one slice, expected value `'strong'` for `'Abcdef123456'`, provenance = card literal, nothing faked — into `templates/test-plan.md`.
