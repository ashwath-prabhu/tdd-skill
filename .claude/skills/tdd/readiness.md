# Readiness Gate

Six items. All required before the first test is written. No exceptions — "we'll figure out the seam as we go" is exactly the habit this skill exists to break.

Five of the six are **facts** — the skill finds these itself, it does not ask the user:

1. **Behavior statement in domain language.** Not "the function returns X" — "a registrant can create an account with a first name." Lifted from the card, confirmed in grill round 1.

2. **Seam as a concrete `file:exportedSymbol` (or route/endpoint), verified to exist.** Not "the register logic" — the actual exported function, class, or mounted route, named precisely. Verify with a real read of the file, not a guess from the filename. Shared mutable module state (a store, a cache, an in-memory array another module also touches) is not a seam — don't point at it; find the public interface that observes the same fact instead.

3. **The command to run a single test, verified by actually running it.** Determined from the project's actual test runner (Jest, Vitest, Mocha, node's built-in runner, etc. — see `scripts/ground.sh`, which discovers this from `package.json` rather than assuming Jest) and confirmed by `scripts/ground.sh` actually executing it, not copied from `CLAUDE.md`/`README.md` on faith.

4. **Existing test conventions, learned by reading 2–3 neighbouring test files in this project.** What runner/assertion style does this project already use (e.g. a request-library pattern for HTTP routes vs. a direct-`require`/`import` pattern for plain modules)? Match whichever convention already exists for the kind of seam under test — don't introduce a new one. Test names follow this project's existing naming convention if one exists (e.g. `should <expected outcome> when <condition>` is one common convention — see grill.md Q5); if no convention exists yet, propose one and confirm it with the user rather than picking silently.

5. **Expected value plus provenance.** The value alone isn't enough — where it came from matters just as much. Provenance is limited to four sources:
   - a literal stated in the card or spec,
   - a worked example the user gives you,
   - a real system's actual observed response (e.g. you ran the endpoint and captured what came back),
   - a manual calculation shown in your reasoning (not "whatever the code returns").

   **"Current behavior" is valid provenance only in retrofit mode**, and only for characterization tests — the test then carries the comment `// characterized <date>, not spec-verified`. It is never valid in greenfield or bugfix mode: greenfield has no current behavior to pin, and bugfix is testing that the current behavior is wrong.

6. **What's real vs. faked at the boundaries.** Named explicitly per [mocking.md](mocking.md) — if the card's seam crosses no external system (no network call, no DB, no filesystem, no clock/randomness dependency), the answer can simply be "everything's real, no system boundary crossed." Don't assume that by default; check what the seam actually touches.

## Hard stop

If `scripts/ground.sh` reports the existing suite is already red, **report it and stop.** Do not write a test, do not proceed to the grill. A developer who can't distinguish your new red from pre-existing red will read the whole thing as noise and start ignoring test failures — which is worse than not having tests.
