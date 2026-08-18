# Seams

A **seam** is the public boundary where behavior is observable without reaching inside the implementation. Every test in this skill lives at a seam. Never at an internal.

In this repo, the seams that exist today:

- **HTTP routes**, exercised through `request(app)` from `app.js` — e.g. `POST /register`, `POST /users`, `GET /users/:id`. This is how `__tests__/register.test.js` already tests `routes/register.js`.
- **Plain exported functions**, exercised by direct `require` — e.g. `password_checker.js:checkPasswordStrength`, as `__tests__/password_checker.test.js` already does.

What is **not** a seam:

- `routes/users_store.js`'s exported `users` array. It's shared mutable state that lets router files see each other's writes — a wiring mechanism, not a public interface. A test that pokes `users` directly to set up state or to verify a write happened is reaching around the seam (`GET /users/:id` or the response body of `POST /users` is the seam that observes the same fact).
- Anything internal to a router handler that isn't reachable through the HTTP response — e.g. there's no seam at "did it call `users.push`," only at "does the response now reflect the new user."

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
  1. routes/register.js (POST /register) — outermost boundary, already has a test file (__tests__/register.test.js), card is about the register flow.
  2. password_checker.js:checkPasswordStrength — inner function register.js would call; only the right seam if the card is about the password rule in isolation, not the endpoint's response.

Which one? (1/2)
```
