# Test Plan — Add validated, unique, immutable alias to data table creation

**Mode:** greenfield — no data-table concept exists in this repo today. This plan covers only the alias validation/uniqueness slice of the card; the CSV→DynamoDB migration and alias-immutability-enforcement (no update-data-table endpoint exists yet to guard) are explicitly out of scope for this loop — see Notes.

## Behavior

A caller creating a data table can supply an `alias`, validated as: required, at most 32 characters, letters and numbers only (no spaces or special characters), and unique across data tables. The create response signals that the alias is not editable (`aliasEditable: false`), documenting the backend contract; enforcing that immutability and rendering "clearly displayed" UI copy are out of scope until an update-data-table endpoint and a frontend exist.

## Agreed seam

- `routes/create_data_table.js` (new) — `POST /data-tables`, exercised via `request(app)`, mirroring `routes/create_user.js`'s convention.
- Backed by a new `entities/data_table.js` Mongoose entity (mirrors `entities/user.js`; add a schema-level `alias: { type: String, required: true, unique: true, maxlength: 32 }` as the actual persistence-layer safeguard, in addition to the route's own validation).

## Reality (what's faked vs. real)

- `entities/data_table.js` (Mongoose model) — faked via `jest.mock('../entities/data_table')`, per `create_user.test.js`'s convention: `create` and `findOne` are mocked per test. This work is about the route's request/response/validation behavior, not query or index correctness, so the DB layer is mocked rather than hit for real.
- The duplicate-alias (409) slice mocks `findOne` to resolve an existing record and asserts the route's handling of that condition — it does not prove the schema-level `unique` index itself enforces the constraint at the DB level; that's accepted as out of scope (see readiness/mocking.md's ranking — a real/seeded DB for the uniqueness constraint is bigger scope than this card).
- Everything else (Express routing, validation logic, response shaping) is real.

## Slices (in order)

### `routes/create_data_table.js`
1. `should return 201 with the created data table when a valid alias is provided`
2. `should return 400 when alias is missing`
3. `should return 400 when alias exceeds 32 characters`
4. `should return 400 when alias contains spaces or special characters`
5. `should return 409 when alias already exists`

## Expected values + provenance

- **201 body**: `{ id, alias, aliasEditable: false, createdAt, updatedAt }` — shape decision made in Grill Q4, modeled on `create_user.js`'s existing response-shaping precedent (`id: <entity>.<idField>` + echoed fields + timestamps).
- **400 body** (missing / too long / invalid chars): `{ error: 'alias is required and must be 1-32 characters, letters and numbers only' }` — one shared message covering all three violations, per Grill Q4 (mirrors `create_user.js`'s single shared 400 message for its own required-field checks). Provenance: card literals (32-char limit, letters/numbers only) + user's shared-message decision.
- **409 body**: `{ error: 'alias already exists' }`, status `409` — user decision in Grill Q4.

## Out of scope (explicitly, per Grill Q1/Q4 — do not build speculatively)

- CSV→DynamoDB migration of existing data-table data (Q1): operational data-migration concern, not a red→green-shaped behavior.
- Enforcing alias immutability on update (Q4 item 5): no update-data-table endpoint exists yet; nothing to guard until one is built as a future card.
- "Clearly displayed" UI copy communicating the alias is locked (Q4 item 4): this repo is backend-only; the `aliasEditable: false` field is the backend contract a future frontend would render.

## Notes

- Single-test command verified: `npx jest __tests__/<file>.test.js`
- `npx jest` full run is currently green (per `ground.sh`); scope each red→green cycle to the single new test file.
