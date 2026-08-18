# Test Plan — <card title>

**Mode:** greenfield | retrofit (characterization) | bugfix

## Behavior

<one or two sentences, domain language, lifted from the card — not implementation language>

## Agreed seams

- `<file>:<exportedSymbol or route>` — <why this is the seam, per seams.md ranking rules>

## Reality (what's faked vs. real)

- <system boundary, if any> — faked because <reason>
- Everything else: real.

## Slices (in order)

1. `<test name in plain English>` — expected: `<value>` — provenance: `<card literal | worked example | observed response | manual calc | (retrofit only) current behavior>`
2. `<test name>` — expected: `<value>` — provenance: `<...>`

## Notes

- Single-test command verified: `npx jest __tests__/<file>.test.js` (or `npx jest -t "<name>"`)
- Existing conventions followed: <e.g. "supertest against `app.js`, matches `__tests__/register.test.js`">
- Retrofit only: characterization tests carry `// characterized <date>, not spec-verified`
