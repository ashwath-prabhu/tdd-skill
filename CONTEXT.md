# Repo Context

## Component → repo/package mapping

This is a single-package repo (no monorepo, no workspaces) — every component below lives in this repo, at the given path.

| Component | Path | Notes |
|---|---|---|
| User CRUD API | `routes/*.js` (mounted from `app.js`) | `create_user.js`, `list_users.js`, `view_user.js`, `update_user.js`, `delete_user.js`, `register.js`, all sharing `routes/users_store.js`'s in-memory `users` array by reference. No persistence — state resets on restart. |
| Password strength check | `password_checker.js` | Standalone, unrelated to the Express app. |
| Tests | `__tests__/*.test.js` | Jest 30 + Supertest 7. Route tests use `request(app)` from `app.js`; plain-module tests `require` the module directly. |

If a future card names a component or package that isn't in this table, the `tdd` skill should ask once which repo/package it belongs to, then add a row here — the same question should never need asking twice.
