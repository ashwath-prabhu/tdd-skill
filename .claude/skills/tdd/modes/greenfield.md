# Greenfield

No code exists yet for this behavior. Full loop: 5-node grill → plan → red-green per slice.

## Loop

1. Run the full grill (all 5 questions in [grill.md](grill.md)). Produce `templates/test-plan.md`.
2. For the first (smallest) slice:
   a. Write the failing test at the agreed seam, with the agreed expected value and its provenance.
   b. Run it with the verified single-test command from readiness item 3. Confirm it fails — and fails for the right reason (missing behavior, not a typo or wrong import).
   c. Write **only enough code** to make that test pass. No speculative branches, no handling for cases the current slice doesn't test.
   d. Run the single test again. Confirm green. Run the full suite (the command `scripts/ground.sh` discovered) to confirm nothing else broke.
3. Move to the next slice from the plan. Repeat step 2 with the next test.
4. When all slices are green, stop. **Refactoring is not part of this loop** — note refactor candidates for review time (see the `code-review` skill), don't act on them here.

## Worked example

Card: add a `'strong'` tier to `password_checker.js:checkPasswordStrength` for 12+ char passwords with mixed case and digits (see the grill worked example in [grill.md](grill.md) for the full round 1).

**Slice 1** (only slice, per the grill's Q5):

```javascript
// __tests__/password_checker.test.js — new test, added to the existing file
test('checkPasswordStrength returns "strong" for a 12+ char password with mixed case and digits', () => {
  expect(checkPasswordStrength('Abcdef123456')).toBe('strong');
});
```

Run `npx jest __tests__/password_checker.test.js` — fails, because `checkPasswordStrength` currently returns `undefined` for any password ≥8 chars. That's the right kind of red: the assertion fires, `undefined !== 'strong'`.

Minimal implementation:

```javascript
function checkPasswordStrength(password) {
  if (password.length < 8) {
    return 'weak';
  }
  if (password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) {
    return 'strong';
  }
}
```

Re-run the single test: green. Run `npx jest`: both suites still pass. Stop — a `'medium'` tier wasn't in this slice's plan; don't add it speculatively.
