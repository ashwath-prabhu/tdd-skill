# Readiness Gate

Six items. All required before the first test is written. No exceptions — "we'll figure out the seam as we go" is exactly the habit this skill exists to break.

Five of the six are **facts** — the skill finds these itself, it does not ask the user:

1. **Behavior statement in domain language.** Not "the function returns X" — "a registrant can create an account with a first name." Lifted from the card, confirmed in grill round 1.

2. **Seam as a concrete `file:exportedSymbol`, verified to exist.** Not "the register route" — `routes/register.js` (router mounted at `POST /register`) or `password_checker.js:checkPasswordStrength`. Verify with a real read of the file, not a guess from the filename. `routes/users_store.js`'s `users` array is shared mutable state, not a seam — don't point at it.

3. **The command to run a single test, verified by actually running it.** In this repo that's `npx jest __tests__/<file>.test.js` for a file or `npx jest -t "<test name>"` for one test by name — both confirmed by `scripts/ground.sh` actually executing them, not copied from `CLAUDE.md` on faith.

4. **Existing test conventions, learned by reading 2–3 neighbouring test files.** In this repo: `__tests__/password_checker.test.js` (plain function call, no supertest) and `__tests__/register.test.js` (supertest against the exported `app`, `describe`/`test`, asserts `res.status` and `res.body`). New tests for a route follow the supertest pattern; new tests for a plain module follow the direct-require pattern.

5. **Expected value plus provenance.** The value alone isn't enough — where it came from matters just as much. Provenance is limited to four sources:
   - a literal stated in the card or spec,
   - a worked example the user gives you,
   - a real system's actual observed response (e.g. you ran the endpoint and captured what came back),
   - a manual calculation shown in your reasoning (not "whatever the code returns").

   **"Current behavior" is valid provenance only in retrofit mode**, and only for characterization tests — the test then carries the comment `// characterized <date>, not spec-verified`. It is never valid in greenfield or bugfix mode: greenfield has no current behavior to pin, and bugfix is testing that the current behavior is wrong.

6. **What's real vs. faked at the boundaries.** Named explicitly per [mocking.md](mocking.md) — in most of this repo the answer is "everything's real, no system boundary crossed," since the app has no external API, and the in-memory `users` store is used live, not mocked.

## Hard stop

If `scripts/ground.sh` reports the existing suite is already red, **report it and stop.** Do not write a test, do not proceed to the grill. A developer who can't distinguish your new red from pre-existing red will read the whole thing as noise and start ignoring test failures — which is worse than not having tests.
