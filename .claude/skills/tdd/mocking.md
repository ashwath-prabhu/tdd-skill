# Mocking

Mock at **system boundaries** only: external APIs, time, randomness, and sometimes DB/filesystem. Never mock your own modules or internal collaborators — if you're mocking something the codebase itself owns, you've picked the wrong seam, not found a reason to mock.

**Mocking the database is a first-class, default-legitimate choice, not a last resort** — but it's one of three legitimate answers (see below), not the automatic default. Check whether the project already has a mocking convention (a `__mocks__/` directory, a `test/mocks/` or `__tests__/mocks/` folder, a per-file `jest.mock`/`vi.mock` pattern, etc.) before inventing a new one — reuse what's already there.

## Where mocks live

Check the project first for an existing convention — many JS/TS projects keep one mock file per boundary/concern (e.g. a `database.mock.js`, an `<external-service>.mock.js`), not one mock per test, to avoid duplicating setup across files. If no convention exists yet and the card needs one, propose the same shape — one file per boundary, reusable across the tests that touch it — and confirm it with the user rather than mocking inline ad hoc.

## How a test wires these in

The common JS pattern is module-level mocking, not per-call stubbing (shown here with Jest's API; Vitest's `vi.mock`/`vi.fn` and other JS runners follow the same shape):

```javascript
jest.mock('../lib/db_connection', () => ({ connect: mockConnect }));
jest.mock('../entities/widget', () => ({ update: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
  // re-require after resetModules so the handler picks up the mocked modules
  handler = require('../handlers/update_widget').handler;
  Widget = require('../entities/widget');
  Widget.update.mockResolvedValue({ modifiedCount: 1 });
});
```

The handler's own code (routing, validation, response shaping) runs for real; only the client it calls through is faked. That's the seam to test at when a card is about handler behavior, not about whether a specific query is correct.

## Choosing how to fake a DB-backed seam — rank these as equals

When Reality (grill.md Q3) touches a DB-backed seam, there are (at least) three legitimate answers. Don't default to "real DB, seeded" just because it's closest to a live seam — pick based on what the card is actually asking to be tested:

1. **Mock the DB layer**, per the pattern above. Fastest, fully deterministic, keeps the project's own code paths real. Right default when the card's behavior is about response/status/business logic sitting in front of the DB call, not about the query itself.
2. **Real DB, seeded per test.** Catches real query/schema mistakes the mock can't. Needed when the card's behavior *is* the query or the schema — e.g. a uniqueness constraint, an index, an aggregation pipeline.
3. **In-memory/ephemeral DB** (e.g. `mongodb-memory-server`, `sqlite` in-memory mode, a testcontainer). A middle ground — real query engine, no live shared instance needed — but if it's a new dev dependency, treat it as bigger scope than the card unless the card specifically needs real query semantics without a live DB.

The same three-way choice applies to any other external system a card touches (queue, cache, third-party API, cloud service) — mock the client, hit a real sandboxed instance, or use an ephemeral/local equivalent, picked for the same reason: does the card's behavior sit in front of the boundary, or is the boundary itself what's being tested.

## Designing for mockability

**1. Dependency injection.** Pass the boundary in rather than constructing it inside the function:

```javascript
// Easy to test — inject the clock
function issueToken(payload, { signFn, nowFn }) {
  return signFn(payload, { iat: nowFn() });
}

// Hard to test — jsonwebtoken and Date.now are baked in
function issueToken(payload) {
  return jwt.sign(payload, SECRET, { iat: Date.now() });
}
```

**2. SDK-style per-operation interfaces over one generic fetcher.** Prefer one `setupXMock()`-style helper per operation (e.g. `setupCreateUserMock`, `setupListItemsMock`) over one generic client mock with conditional logic based on which call was made — it keeps each test's setup readable and makes the boundary being faked explicit.
