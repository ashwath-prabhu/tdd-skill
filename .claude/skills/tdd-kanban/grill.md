# Grill

A bounded interview that produces `templates/test-plan.md`. The point isn't to interrogate for its own sake — it's to make sure every decision that changes which test gets written next has actually been made, out loud, before any test exists.

## Question order

Ask in this order because each round can depend on the answer to the round before it — a question whose answer depends on an open question belongs to a **later** round, not this one:

1. **Behavior** — What can a caller do that they couldn't before? State it in domain language, lifted from the card (e.g. "a registrant can create an account with a first name" — not "the router returns 201").
2. **Seam** — Which public boundary is that observable at? (See [seams.md](seams.md).) e.g. `POST /register` via `request(app)`, or `password_checker.js:checkPasswordStrength` via a direct `require`.
3. **Reality** — What's real in the test, what's faked? Only system boundaries get faked (see [mocking.md](mocking.md)) — e.g. "real Express app, real in-memory `users` store, no external calls to fake."
4. **Expected value** — What exactly comes out, **and where did that value come from?** (See readiness item 5 — provenance is mandatory.)
5. **Slice order** — Which tracer bullet goes first? Smallest observable slice that proves the seam wired correctly, not the whole feature at once.

## Rules

- Ask the **whole frontier** in one round — every question whose answer doesn't depend on a still-open question — numbered, then wait for the reply. Don't trickle questions one at a time.
- Every question carries a recommended answer with a half-sentence of *why*. The `➡️` line is the team's training programme in miniature — it has to teach the reasoning, not just hand over a decision.
- Format, exactly:

```
❓ **Q1** - **<title>**: <body, may include ranked choices with evidence>

➡️ <recommendation + why>
```

- Round budget: **max 2 rounds for a bug, 3 for a story**. If you're not converged by then, take your own recommendations and say so.
- If an answer wouldn't change which test gets written next, it's not a frontier question — drop it.
- **Facts are never asked of the user.** Anything discoverable — does this file exist, what does the test runner print, what branch are we on — is dispatched to `scripts/ground.sh` or `scripts/find-seam.sh`, not asked. Only ask about **decisions**: what should happen, what's in scope, what's the right seam among candidates.
- "Go with your recommendations" must be a valid, sufficient reply — every `➡️` line has to add up to a sound, buildable plan on its own.
- **Question 4 (expected value) is mandatory and never skipped.** If the answer is "whatever the function returns" or "I'll run it and see," that's a forming tautological test (readiness item 5 / provenance). Name it as such and re-ask — don't accept it and move on.

## Worked example — round 1, on this repo

Card: *"As a user, I want `checkPasswordStrength` to return `'strong'` for passwords of 12+ characters that mix case and digits, so the register endpoint can reject weak passwords."*

```
❓ **Q1** - **Behavior**: What can a caller do that they couldn't before? Candidates:
  1. `checkPasswordStrength` classifies any password into weak/medium/strong (broad).
  2. `checkPasswordStrength` additionally recognizes a 'strong' tier for 12+ chars with mixed case and digits (narrow, matches the card).

➡️ Go with (2) — the card only asks for the strong tier; today the function returns `undefined` for anything ≥8 chars, so widening scope beyond what's asked risks building the medium tier on a guess.

❓ **Q2** - **Seam**: `password_checker.js:checkPasswordStrength`, called directly (as `__tests__/password_checker.test.js` already does), or through `POST /register`?

➡️ `password_checker.js:checkPasswordStrength` directly — it's the outermost boundary where this specific behavior is observable; `register.js` doesn't call it yet, so testing through the route would be testing code that doesn't exist.

❓ **Q3** - **Reality**: Anything to fake?

➡️ Nothing — pure function, no system boundary crossed. All real.

❓ **Q4** - **Expected value**: For input `'Abcdef123456'` (12 chars, mixed case, digits), what should `checkPasswordStrength` return, and where does `'strong'` as the literal come from?

➡️ `'strong'` — it's a literal named directly in the card text, so provenance is "card literal," not a guess or a rerun of the implementation.

❓ **Q5** - **Slice order**: One slice (strong-tier detection) or split further?

➡️ One slice — the card describes a single rule (length + case + digit), there's no smaller independently-observable behavior to peel off first.
```

Reply `"go with your recommendations"` and the plan in `templates/test-plan.md` is: seam `password_checker.js:checkPasswordStrength`, one slice, expected value `'strong'` for `'Abcdef123456'`, provenance = card literal, nothing faked.
