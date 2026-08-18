# Good and Bad Tests

Examples below use this repo's actual framework: Jest 30 + Supertest 7, files in `__tests__/*.test.js`, run with `npx jest`.

## Good tests

Test behavior through the public seam, with one logical assertion, using an expected value with real provenance.

```javascript
// GOOD — tests the observable HTTP behavior, expected value is a card literal
const request = require('supertest');
const app = require('../app');

describe('POST /users', () => {
  test('creates a user and returns it with a generated id', async () => {
    const res = await request(app).post('/users').send({ name: 'Alice', email: 'alice@example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, name: 'Alice', email: 'alice@example.com' });
  });
});
```

This survives a refactor: if `create_user.js` starts assigning ids from a UUID library, this test only breaks if the response shape actually changes — not because of how the id was generated internally.

```javascript
// GOOD — plain-function seam, direct require, matches __tests__/password_checker.test.js's existing style
const { checkPasswordStrength } = require('../password_checker');

test('checkPasswordStrength returns "weak" for a password under 8 characters', () => {
  expect(checkPasswordStrength('abc123')).toBe('weak');
});
```

## Bad tests

**Implementation-coupled** — reaches into `routes/users_store.js` instead of using the HTTP seam:

```javascript
// BAD — bypasses the interface, couples the test to the store's shape
const { users } = require('../routes/users_store');

test('POST /users adds to the users array', async () => {
  await request(app).post('/users').send({ name: 'Alice', email: 'alice@example.com' });
  expect(users.find((u) => u.name === 'Alice')).toBeDefined();
});

// GOOD — same behavior, verified through the seam a caller actually has
test('created user is retrievable via GET /users/:id', async () => {
  const created = await request(app).post('/users').send({ name: 'Alice', email: 'alice@example.com' });
  const fetched = await request(app).get(`/users/${created.body.id}`);
  expect(fetched.body).toEqual({ id: created.body.id, name: 'Alice', email: 'alice@example.com' });
});
```

**Tautological** — expected value is recomputed the way the code computes it, so it can't disagree with a bug in that computation:

```javascript
// BAD — the "expected" id is derived the exact way create_user.js derives it;
// if create_user.js's id logic is wrong, this test can't catch it
test('creates a user with the next id', async () => {
  const before = (await request(app).get('/users')).body;
  const res = await request(app).post('/users').send({ name: 'Bob', email: 'bob@example.com' });
  expect(res.body.id).toBe(before.length + 1); // same formula as the implementation
});

// GOOD — expected id is a known literal from a controlled starting state
test('creates the first user with id 1', async () => {
  const res = await request(app).post('/users').send({ name: 'Bob', email: 'bob@example.com' });
  expect(res.body.id).toBe(1);
});
```

**Horizontal slicing** — writing the whole shape of the test suite before any implementation exists, e.g. stubbing out `test.todo(...)` for every CRUD verb on `/users` before `list_users.js` or `update_user.js` exist. This locks in an imagined shape and produces tests insensitive to what the implementation actually turns out to need. Work one seam, one test, one minimal implementation at a time instead (see the mode files under `modes/`).

**Side-channel verification** — same failure as the implementation-coupled example above, generalized: whenever a test's assertion reads from somewhere other than the seam it just called (a shared array, a log line, a private field), it's checking a side channel instead of the interface.
