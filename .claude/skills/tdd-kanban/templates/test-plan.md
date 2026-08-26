# Test Plan — User Management: List and Search Users (display + pagination slice)

**Mode:** greenfield

## Behavior

An administrator can list users via `GET /users`, seeing each user's first name, last name, email, user ID, and created date, returned inside a paginated envelope. (Sort by first/last name and search by username/first name/email are separate follow-on behavior, out of scope for this round.)

## Agreed seams

- `routes/list_users.js` (route: `GET /users`), exercised via `request(app)` — outermost observable boundary; already wired into `app.js` (which currently fails to load since the file was deleted). No inner function is a separate candidate.

## Reality (what's faked vs. real)

- `entities/user.js` (the Mongoose `User` model) — faked via `jest.mock('../entities/user')`. `User.countDocuments` and `User.find().skip().limit()` are stubbed to resolve canned values. This slice is about response shaping over the DB call, not query correctness, so the DB layer is mocked rather than hit for real.
- Everything else (Express routing, request/response handling, pagination math) is real.

## Slices (in order)

1. `should return 200 with an empty envelope when no users exist` — expected: `{ data: [], pagination: { total_records: 0, current_page: 1, total_pages: 1 } }`, status `200` — provenance: card's empty-state acceptance criterion (unhappy path) + user's clarification that `total_pages` is `1` when `total_records` is `0`.
2. `should return 200 with all users and their display fields when no page/limit is given` — expected: `200`, `data` = array of `{ userId, firstName, lastName, email, createdAt }` for every mocked user, `pagination: { total_records: N, current_page: 1, total_pages: 1 }` — provenance: card's required field list + `entities/user.js` schema fields + user's "no default, return everything" decision.
3. `should return 200 with a paginated page of users when page/limit are given` — expected: `GET /users?page=1&limit=10` against 25 mocked users → `200`, `data` = first 10, `pagination: { total_records: 25, current_page: 1, total_pages: 3 }` — provenance: user-specified envelope shape + manual calc `Math.ceil(25/10) = 3`.

## Notes

- Single-test command verified: `npx jest __tests__/list_users.test.js`
- Existing conventions followed: supertest against `app.js`, `describe`/`test`, asserts `res.status`/`res.body` (matches `__tests__/register.test.js`'s committed pattern at `HEAD`).
- Full suite is red for unrelated reasons (uncommitted, unrelated mock/test files in `__tests__/mocks` and `__tests__/unit`) — every run in this loop is scoped to `__tests__/list_users.test.js`, not the full `npx jest`.
- Do not reuse `__tests__/mocks/common.mock.js` / `database.mock.js` — they reference paths (`lib/helpers`, `lib/mongo_connection`) that don't exist in this repo. Mock `entities/user.js` directly and locally in this test file.
