# Seams

A **seam** is the public boundary where behavior is observable without reaching inside the implementation. Every test in this skill lives at a seam. Never at an internal.

Common shapes a seam takes in a JS/TS project — inspect the actual repo to find which apply, don't assume:

- **HTTP routes/endpoints**, exercised through an HTTP client against the app (e.g. `supertest`'s `request(app)`, or an equivalent for the framework in use).
- **Plain exported functions/classes**, exercised by direct `require`/`import`.
- **CLI commands**, exercised by invoking the command and asserting on stdout/exit code.
- **Message/event handlers**, exercised by publishing the message/event and asserting on the observable side effect (a persisted record, a follow-up event, a response).

What is **not** a seam:

- Shared mutable module state (an exported store/array/cache another module reads or writes) used to wire two modules together. It's a wiring mechanism, not a public interface — a test that pokes it directly to set up state or verify a write happened is reaching around the seam; the outer interface that observes the same fact (a route's response, a function's return value) is the seam.
- Anything internal to a handler that isn't reachable through its public output — e.g. there's no seam at "did it call the internal helper," only at "does the observable output now reflect the change."

## Ranking candidate seams

When more than one boundary could plausibly be "the" seam for a behavior, rank by:

1. **Outermost observable boundary wins.** If the behavior is observable through the HTTP route, test there rather than at an inner function the route calls — the route is what callers actually use.
2. **Exported over internal.** A function assigned to `module.exports` outranks a helper closed over inside the file.
3. **Already modified in this branch is strong evidence.** If `scripts/find-seam.sh` shows a file touched by uncommitted changes or by commits matching the card's ticket id, that file is very likely the right seam — recent intent beats guessing from the card text alone.
4. **Things we fake are boundaries, not seams.** If the card involves an external API, time, or randomness, the fake sits at that boundary (see [mocking.md](mocking.md)) — the seam under test is still the caller-facing function that uses the fake, not the fake itself.

## Presentation format

When more than one seam is plausible, present ranked candidates with evidence and let the user answer with a single digit:

```
Candidate seams, ranked:
  1. routes/register.js (POST /register) — outermost boundary, already has a test file for it, card is about the register flow.
  2. lib/passwordStrength.js:checkPasswordStrength — inner function the route would call; only the right seam if the card is about the password rule in isolation, not the endpoint's response.

Which one? (1/2)
```
