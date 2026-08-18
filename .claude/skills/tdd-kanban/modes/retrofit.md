# Retrofit

Code already exists. Sub-classify **first** — the three cases need different treatment, and picking wrong either skips a required safety step or wastes effort on code nobody's touching.

Label the plan and the card comment `mode: retrofit (characterization)` in every sub-case. **Never report retrofit as TDD** — pinning existing behavior is not the same discipline as deriving behavior from a spec, and calling it TDD teaches the team the wrong thing.

## (a) Code written today for this card, test skipped

The team's default failure mode: code got written first, no test exists yet, but it's fresh — you (or whoever wrote it) still know what it's supposed to do.

1. Write the test at the seam, expected value with real provenance (card literal / worked example / manual calc — **not** "whatever the function returns," see readiness item 5).
2. Run it. It should pass immediately, since the code already exists.
3. **Required, non-skippable:** run `scripts/prove-test.sh <test-file> <source-file>`. It deliberately breaks the source (inverts a condition or hardcodes a return), confirms the test goes red, then restores it and confirms green again. If the test stays green while the logic is gutted, the test isn't testing anything — fix the test before moving on.

Example: `routes/create_user.js` was written without a test.

```javascript
test('POST /users creates a user and returns 201', async () => {
  const res = await request(app).post('/users').send({ name: 'Alice', email: 'alice@example.com' });
  expect(res.status).toBe(201);
  expect(res.body).toEqual({ id: 1, name: 'Alice', email: 'alice@example.com' });
});
```

Then: `scripts/prove-test.sh __tests__/create_user.test.js routes/create_user.js` — it should flip the `id: users.length + 1` line or the status code and watch the test fail, then restore and watch it pass again.

## (b) Old code, the card changes it

1. **Characterize the seam being touched** — write a test that pins what the seam does *right now*, before changing anything. Mark it: `// characterized <date>, not spec-verified`.
2. If current behavior looks wrong while characterizing it, **pin it and note it — don't fix it in this step.** Fixing hides in a "characterization" commit is how regressions get introduced without a red-green record.
3. Get the characterization test green against the untouched code.
4. Now TDD the actual card work on top: grill (behavior/seam/reality/expected-value/slice-order) for the *change*, red-green per slice, same as greenfield.

Example: card asks `routes/update_user.js` to also validate email format. Before touching it:

```javascript
// characterized 2026-08-11, not spec-verified
test('PUT /users/:id currently accepts any string as email, including invalid formats', async () => {
  const created = await request(app).post('/users').send({ name: 'Bob', email: 'bob@example.com' });
  const res = await request(app).put(`/users/${created.body.id}`).send({ name: 'Bob', email: 'not-an-email' });
  expect(res.status).toBe(200);
});
```

That pins the current (arguably wrong) permissiveness. Now grill the actual card ("reject invalid email format") and TDD it on top — that new test will supersede or narrow the characterization test, which is expected.

## (c) Old code, coverage for its own sake

No card is driving this — someone just wants tests added to old code because it lacks them. **Push back.** Recommend waiting until the code is next touched by a real card, at which point (b) applies. Testing stable, unchanging code adds maintenance cost without catching anything, since nothing about it is in flux.
