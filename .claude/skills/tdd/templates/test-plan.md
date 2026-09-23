# Test Plan — <card title>

**Mode:** <greenfield | retrofit (characterization) | bugfix> — <one-line reason, e.g. "no existing code for this behavior" or "`file.js` already exists and this card changes it">

## Behavior

<the observable behavior in domain language, lifted from the card and confirmed in Grill Q1>

## Agreed seam(s)

- `<file>:<exportedSymbol>` (or route/endpoint) — <how it's exercised, e.g. via a direct require/import, or an HTTP client against the app>

## Reality (what's faked vs. real)

- <what's real>
- <what's faked, and why — per mocking.md's boundary rules; omit this list item and say "everything's real, no system boundary crossed" if true>

## Slices (in order)

### `<file>`
1. `<literal test name, exact string that will appear in the test file>`
2. `<literal test name>`

## Expected values + provenance

- **<slice/case>**: `<expected value>` — provenance: <card literal | worked example | observed real response | manual calculation>

## Out of scope (explicitly, per Grill — do not build speculatively)

- <anything discussed and deliberately deferred>

## Notes

- Single-test command verified: `<command from scripts/ground.sh>`
- Full-suite status at Ground: <green | red-for-unrelated-reasons, cite scripts/ground.sh output>
