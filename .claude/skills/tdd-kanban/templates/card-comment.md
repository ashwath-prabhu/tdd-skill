<!--
Paste this on the Kanban card. It's what PR review diffs the actual test file against —
keep the slice list as literal test names, since that's what should show up in the diff.
-->

**mode:** greenfield

**seams:**
- `routes/list_users.js` (`GET /users`)

**slices (test names, in order):**
1. `should return 200 with an empty envelope when no users exist`
2. `should return 200 with all users and their display fields when no page/limit is given`
3. `should return 200 with a paginated page of users when page/limit are given`

**faked at boundaries:** `entities/user.js` (Mongoose `User` model) — `countDocuments` and `find().skip().limit()` mocked; DB query correctness itself is out of scope for this round.

**out of scope for this round (follow-up cards):** sort by first/last name; search by username/first name/email; combined sort+search filter preservation.
