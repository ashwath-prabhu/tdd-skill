<!--
Paste this on the Kanban card. It's what PR review diffs the actual test file against —
keep the slice list as literal test names, since that's what should show up in the diff.
-->

**mode:** greenfield

**seams:**
- `routes/create_data_table.js` (`POST /data-tables`)

**slices (test names, in order):**
1. `should return 201 with the created data table when a valid alias is provided`
2. `should return 400 when alias is missing`
3. `should return 400 when alias exceeds 32 characters`
4. `should return 400 when alias contains spaces or special characters`
5. `should return 409 when alias already exists`

**faked at boundaries:** `entities/data_table.js` (Mongoose `DataTable` model) — `create` and `findOne` mocked; DB uniqueness-constraint/query correctness itself is out of scope for this round.

**out of scope for this round (follow-up cards):** CSV→DynamoDB migration of existing data-table data (operational data-migration task, not a testable behavior); enforcing alias immutability on update (no update-data-table endpoint exists yet); "clearly displayed" UI copy communicating the lock (this repo is backend-only — the response's `aliasEditable: false` field is the contract a future frontend would render).
