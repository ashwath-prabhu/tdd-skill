# Test Plan — Migrate user CRUD routes off users_store.js onto MongoDB

**Mode:** retrofit (characterization) — old code, the card changes it. Characterization of the old in-memory `users` array is deliberately skipped: the storage mechanism and response shape are being wholesale replaced (per the user's explicit field-shape and required-field decisions below), so a test pinning the old `{id, name, email}` in-memory behavior would provide no regression protection and would be deleted in the same slice it's written. Old behavior is not being incrementally amended; it's being discarded on purpose.

## Behavior

`routes/create_user.js`, `routes/view_user.js`, `routes/update_user.js`, `routes/delete_user.js` currently read/write `routes/users_store.js`'s in-memory `users` array. They must instead persist through the Mongoose `User` entity (`entities/user.js`), the same model `list_users.js`/`register.js` already use, so `routes/users_store.js` can be deleted and there is a single user data model in the app.

- Response shape switches from `{id, name, email}` to `{id, firstName, lastName, email, createdAt, updatedAt}` (id = `user.userId`), matching `register.js`'s existing response shaping — user decision.
- `POST /users` and `PUT /users/:id` require `firstName` and `email` (400 otherwise) — user decision, stricter than `register.js`'s firstName-only check since email is central to identifying a user here.
- `:id` param is now the Mongo `userId` string, not a `Number()`-parsed array index.

## Agreed seams

- `routes/create_user.js` (`POST /users`)
- `routes/view_user.js` (`GET /users/:id`)
- `routes/update_user.js` (`PUT /users/:id`)
- `routes/delete_user.js` (`DELETE /users/:id`)

All exercised via `request(app)`, per `__tests__/list_users.test.js`'s convention.

## Reality (what's faked vs. real)

- `entities/user.js` (Mongoose `User` model) — faked via `jest.mock('../entities/user')`, per `list_users.test.js`. This work is about route request/response shaping over the DB call, not query correctness, so the DB layer is mocked rather than hit for real.
- Everything else (Express routing, validation, response shaping) is real.

## Slices (in order)

### `routes/create_user.js`
1. `should return 400 when firstName is missing`
2. `should return 400 when email is missing`
3. `should return 201 with the created user when firstName and email are provided`

### `routes/view_user.js`
4. `should return 404 when no user matches the given id`
5. `should return 200 with the matching user when the id exists`

### `routes/update_user.js`
6. `should return 404 when no user matches the given id`
7. `should return 400 when firstName is missing`
8. `should return 400 when email is missing`
9. `should return 200 with the updated user when a valid payload is given`

### `routes/delete_user.js`
10. `should return 404 when no user matches the given id`
11. `should return 204 when the user is deleted`

Expected-value provenance for all "happy path" slices: `entities/user.js` schema fields + user's field-shape decision + `register.js`'s existing response-shaping precedent (`id: user.userId`, plus `firstName`/`lastName`/`email`/`createdAt`/`updatedAt`). Provenance for 400/404 slices: user's required-fields decision (literal) / not-found is the pre-existing route contract carried forward unchanged.

## Notes

- Single-test command verified: `npx jest __tests__/<file>.test.js`
- Full suite (`npx jest`) is red for unrelated pre-existing reasons (`__tests__/mocks/aws.mock.js`, `__tests__/mocks/common.mock.js`, `__tests__/unit/associate_multiple_forms.unit.test.js` reference a `lib/` dir and an npm package that don't exist in this repo) — every run in this loop is scoped to the relevant single test file, not the full `npx jest`.
- After all slices are green, delete `routes/users_store.js` and confirm nothing else `require`s it.
