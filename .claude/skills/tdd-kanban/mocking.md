# Mocking

Mock at **system boundaries** only: external APIs, time, randomness, and sometimes DB/filesystem. Never mock your own modules or internal collaborators — if you're mocking something this repo owns, you've picked the wrong seam, not found a reason to mock.

## What counts as a boundary in this repo

Right now `routes/`, `app.js`, and `password_checker.js` cross **no external system boundary** — no network call, no real filesystem, no clock-sensitive logic. That means: most tests in this repo today fake nothing. Say so explicitly in the grill's Reality question rather than reaching for a mock out of habit.

The dependencies already in `package.json` point at where boundaries *will* show up as the app grows:

- **`bcryptjs`** — hashing is deliberately slow and salted; a test asserting an exact hash would be tautological (readiness item 5) and slow. If a card needs a test that a password was hashed, assert observable behavior instead — "the stored password isn't equal to the plaintext" or "the API's login seam accepts the original plaintext" — not the hash literal. If you must fix the salt for a deterministic test, inject it (see below) rather than reaching into bcryptjs internals.
- **`jsonwebtoken`** — token expiry is time-based. If a card needs "token expires after 1 hour," fake the clock (e.g. inject `Date.now` or a `nowFn`), not `jsonwebtoken` itself — the real signing/verification logic is exactly what you want exercised.
- **`routes/users_store.js`'s `users` array** — this is *not* a system boundary, it's the app's own in-memory state, already faked in the sense that there's no real database yet. Reset it between tests by mutating the real array (`users.length = 0`) — don't mock `require('./users_store')`.

If a future card adds a real external call (a payment provider, an email service, a real database), that call is the boundary to fake — everything on this repo's side of it stays real.

## Designing for mockability, when a boundary does show up

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

**2. SDK-style per-operation interfaces over one generic fetcher.** If this app grows an external client, give it one function per operation:

```javascript
// GOOD — each op independently fakeable, one shape per fake
const paymentClient = {
  charge: (amount) => fetch('/charge', { method: 'POST', body: amount }),
  refund: (id) => fetch(`/refund/${id}`, { method: 'POST' }),
};

// BAD — faking requires conditional logic based on the endpoint argument
const paymentClient = {
  request: (endpoint, options) => fetch(endpoint, options),
};
```
