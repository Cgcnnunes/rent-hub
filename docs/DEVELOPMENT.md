# Development Workflow

## Current status

The repository currently contains documentation and Git initialization only. Application packages, dependency manifests, and runnable commands have not been created. Do not treat example or planned commands as available until the repository foundation defines them.

## Planned foundation

The first implementation phase should add:

- npm workspace configuration and strict TypeScript.
- Nx project/task configuration for affected checks, builds, and deployments.
- ESLint and Prettier configuration.
- Vitest and Playwright configuration appropriate to the applications.
- Husky hooks and Commitlint.
- Local Node.js and Cloudflare-compatible development adapters.
- Local database, migrations, and test data that do not use PROD resources.

## Branch and pull request workflow

1. Review product, architecture, and feature documentation.
2. Create a feature branch from `main` using `rent-xxxxx` with a five-digit sequential feature number.
3. Implement the change in the correct application/package and add tests.
4. Update affected docs and the glossary.
5. Run relevant local checks and verify runtime compatibility where applicable.
6. Commit as `type(rent-xxxxx): concise lowercase description`.
7. Open a pull request to `main`, selecting exactly one of Major, Minor, or Patch. Its title must follow the commit format and leave room for GitHub's ` (#number)` suffix within the 120-character description limit.
8. Pass PR validation and obtain one approval.
9. Squash and merge using a correctly formatted commit subject; merged changes are then considered for TEST deployment. Do not edit the final squash subject to bypass the convention.

The commit sequence is separate from the feature-branch sequence. A collision-safe assignment mechanism is unresolved; do not assume the branch number is the commit number or enforce a race-prone local counter.

Allowed commit types are `feat`, `chore`, `refactor`, `fix`, and `doc`. The lowercase description must not exceed 120 characters.

## Planned Git hooks

- **Pre-commit:** run formatting, linting, and relevant unit tests; use affected checks where practical.
- **Commit-msg:** validate the commit format, allowed type, lowercase description, and description length. Do not enforce a race-prone identifier allocator.
- **Pre-push:** reject direct pushes to `main` and feature branches that do not match `rent-xxxxx`; run relevant affected checks without PROD resources.

PR validation remains the authoritative quality gate. The precise commands will be documented when the workspace and hooks are implemented.

The bootstrap PR workflow validates each PR commit subject and the PR title, including the GitHub squash suffix. It uses `node --test scripts/validate-commit-messages.test.cjs` to test the validator. A PR check cannot validate edits made to the squash message at merge time. A GitHub-side commit metadata restriction was rejected by the current repository configuration, so the person merging must check the final subject. The existing administrator bypass also remains in place.

## Code conventions

- Use strict TypeScript, explicit public contract types, and explicit function return types.
- Do not use `any`; avoid unsafe assertions.
- Validate external input at system boundaries.
- Use single quotes and Prettier formatting.
- Order imports, exports, and object keys alphabetically where safe and meaningful; preserve order where it affects behavior or clarity.
- Keep functions focused, names meaningful, and abstractions justified.
- Keep user-facing text in localization resources rather than business logic.
- Do not access databases or provider bindings from the frontend.

## Documentation lifecycle

Documentation is part of implementation. Keep active guides aligned with actual behavior, remove obsolete instructions when a feature changes, preserve released history in `CHANGELOG.md`, and update the glossary when introducing terms.
