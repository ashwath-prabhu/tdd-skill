# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Start the server: `npm start` (runs `app.js` on `PORT` env var, default 3000)
- Run all tests once: `npx jest`
- Run tests in watch mode: `npm test` (this repo's `test` script is `jest --watchAll`, so avoid it in non-interactive contexts)
- Run a single test file: `npx jest __tests__/password_checker.test.js`
- Run a single test by name: `npx jest -t "test name"`

## Architecture

This is a small Express app with two independent, unrelated pieces:

1. **`routes/`** — a user CRUD API mounted on the root path in `app.js`. Each HTTP verb/action lives in its own file (`create_user.js`, `list_users.js`, `view_user.js`, `update_user.js`, `delete_user.js`), and all of them share one in-memory data store, `routes/users_store.js`, which exports a single `users` array by reference. Any new route file that needs to read/write users must `require('./users_store')` rather than declaring its own array — the store is what makes state visible across router files. There is no persistence; state resets on restart.

2. **`password_checker.js`** — a standalone module unrelated to the Express app, tested via `__tests__/password_checker.test.js`.

## Test-Driven Development

This repo uses the `tdd` skill (`.agents/skills/tdd/SKILL.md`) for building features test-first. Key points enforced by that skill:

- Tests are written at **seams** — public interfaces — and never against internals (no mocking internal collaborators, no testing private methods, no side-channel verification).
- Seams must be agreed with the user before any test is written.
- Follow **red → green**: write a failing test, then write the minimal code to pass it — one seam, one test, one implementation per cycle. Don't write speculative tests ahead of the implementation (no horizontal slicing).
- Refactoring happens at review time, not inside the red → green loop.
