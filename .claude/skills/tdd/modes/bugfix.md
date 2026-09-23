# Bugfix

A defect with observable wrong behavior. Reproduce → failing reproduction test at the seam where the wrongness is visible → fix → green. The failing test comes first, no exceptions — if you fix it before the test exists, there's no proof the bug is gone or that it won't come back.

## Grill (short — ~3 questions, max 2 rounds)

1. **Reproduce** — what's the exact input/sequence that triggers the wrong behavior?
2. **Seam** — at what public boundary is the wrongness observable?
3. **Expected instead** — what should it return/do instead, and what's the provenance of that expected value (readiness item 5 — a spec literal, a worked example, or a manual calculation; never "whatever a fixed version would return," which is circular)?

## Loop

1. Write a test at the seam that reproduces the bug, asserting the **correct** expected behavior (not the current broken one).
2. Run it. Confirm it fails, and fails by showing the actual bug (e.g. a timeout/hang, a wrong status code, a wrong body) — not by erroring for an unrelated reason like a typo in the test.
3. Fix the minimum needed to make that test pass. Don't refactor surrounding code in the same pass.
4. Run the single test: green. Run the full suite: confirm no regression.

## Worked example

Bug: `POST /register` with a `firstName` present never responds — the handler validates `firstName`, and if it's present, falls through with no code after the `if` block, so Express never sends a response and the request hangs.

```javascript
// routes/register.js — current code
router.post('/register', (req, res) => {
  const { firstName } = req.body;
  if (!firstName) {
    return res.status(400).json({ message: 'First Name is required' });
  }
  // falls through here — no response sent when firstName IS present
});
```

Grill:

```
❓ **Q1** - **Reproduce**: `POST /register` with `{ firstName: 'Jane', ... }` — a request that should succeed.

➡️ Confirmed by reading the handler: there's no code path after the validation `if` when firstName is present, so the response is never sent.

❓ **Q2** - **Seam**: `routes/register.js` via `POST /register` (matches `__tests__/register.test.js`'s existing pattern) — that's where the missing response is observable.

➡️ Same seam the existing register test already uses; no reason to test lower.

❓ **Q3** - **Expected instead**: the card doesn't specify a success response shape yet — treat that as a blocking gap, not a bugfix decision. Recommend: 201 with the created registrant's `firstName`, mirroring `create_user.js`'s 201-with-created-resource convention.

➡️ Borrowing the sibling route's convention is a worked example, not a guess — flag it for the user to confirm before writing the test.
```

Failing test (once the expected shape is confirmed):

```javascript
test('accepts a present firstName and responds instead of hanging', async () => {
  const res = await request(app).post('/register').send({ firstName: 'Jane' });
  expect(res.status).toBe(201);
  expect(res.body).toEqual({ firstName: 'Jane' });
});
```

This fails today (supertest will see the request time out / never resolve with a status). Fix: add the missing `return res.status(201).json({ firstName })` — nothing more, no unrelated cleanup of the file in the same pass.
