# Mocking

Mock at **system boundaries** only: external APIs, time, randomness, and sometimes DB/filesystem. Never mock your own modules or internal collaborators — if you're mocking something this repo owns, you've picked the wrong seam, not found a reason to mock.

**Mocking the database is a first-class, default-legitimate choice here — not a last resort.** The repo already has a convention for it (`__tests__/mocks/`, below); don't let "prefer a real DB" bias rule it out when it's the right tool for the seam under test.

## Where mocks live in this repo

`__tests__/mocks/` holds one file per boundary/concern, not one file per test:

- **`common.mock.js`** — mock factories that aren't tied to one external system: `mockRequest()`/`mockResponse()` Express stubs, a token/auth-payload builder (`getUserToken`), deterministic helpers for things that are otherwise random or slow (`mockCrypto`, `getRandomDate`). These exist to kill repetition across test files, not to hide a system boundary — most of what's in here is test-data shaping, plus a couple of genuine boundaries (crypto) that happen to be common across many tests.
- **`database.mock.js`** — the database boundary, faked at the connection layer: `connect` resolves to a stub with `disconnect` and a fake `connection` (readyState/host/port/name), so any code that opens or closes a DB connection gets a resolved promise instead of hitting a real one. Paired with per-entity mocks at the call site (e.g. `jest.mock('.../entities/documentdb/DocumentPacket', () => ({ updateMany: jest.fn() }))`) so a handler's DB calls return exactly the shape the test needs.
- **one file per additional external system**, same shape — e.g. `aws.mock.js` wraps `aws-sdk-client-mock`'s `mockClient(...)` once per AWS client (`S3Client`, `SQSClient`, `VerifiedPermissionsClient`, `DynamoDBClient`), exposing a `setupXMock()` per operation and a single `resetAllMock()`. Note: `aws-sdk-client-mock` and the `@aws-sdk/*` clients aren't in this repo's `package.json` yet — `aws.mock.js` is the pattern to follow when a card actually introduces an AWS call, not something runnable today.

This is the layering rule going forward: a mock that's reusable across many test files and isn't a system boundary → `common.mock.js`. A mock of the database → `database.mock.js`. A mock of any other external system → its own `<system>.mock.js`.

## How a test wires these in

The convention (see `associate_multiple_forms.unit.test.js`) is module-level mocking, not per-call stubbing:

```javascript
jest.mock('../../lib/mongo_connection', () => ({ connect: mockConnect }));
jest.mock('../../entities/documentdb/DocumentPacket', () => ({ updateMany: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
  // re-require after resetModules so the handler picks up the mocked modules
  handler = require('../../handlers/associate_multiple_forms').handler;
  DocumentPacket = require('../../entities/documentdb/DocumentPacket');
  DocumentPacket.updateMany.mockResolvedValue({ modifiedCount: 2 });
});
```

The handler's own code (routing, validation, response shaping) runs for real; only the DB client it calls through is faked. That's the seam this repo tests at when a card is about handler behavior, not about whether a specific Mongo query is correct.

## Choosing how to fake a DB-backed seam — rank these as equals

When Reality (grill.md Q3) touches a DB-backed seam, there are (at least) three legitimate answers. Don't default to "real DB, seeded" just because it's closest to a live seam — pick based on what the card is actually asking to be tested:

1. **Mock the DB layer**, per `database.mock.js`'s pattern above. Fastest, fully deterministic, keeps this repo's own code paths real. Right default when the card's behavior is about response/status/business logic sitting in front of the DB call, not about the query itself.
2. **Real DB, seeded per test.** Catches real query/schema mistakes the mock can't. Needed when the card's behavior *is* the query or the schema — e.g. a uniqueness constraint, an index, an aggregation pipeline.
3. **In-memory DB** (e.g. `mongodb-memory-server`). A middle ground — real query engine, no live instance needed — but it's a new dev dependency, so treat it as bigger scope than the card unless the card specifically needs real query semantics without a live DB.

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

**2. SDK-style per-operation interfaces over one generic fetcher.** `aws.mock.js` already does this — one `setupXMock()` per operation (`setupS3Mock`, `setupSqsMock`, `setupQueryItemsMock`) instead of one generic client mock with conditional logic based on which command was called.
