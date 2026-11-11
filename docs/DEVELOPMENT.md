# Development Workflow

## Current status

The foundation is in progress. The initial web page and API health endpoint are scaffolding, not business features.

Node API serving and local Worker runtime tests are available. Local data services, lint/format and hooks, complete CI quality gates, and a Next.js-on-Workers prototype remain to be implemented and verified.

`npm audit` currently reports a moderate-severity development dependency advisory in the Nx/minimatch chain; production dependencies reported no advisories during this validation. Track and re-evaluate the advisory before considering the foundation complete.

The Worker test harness currently pins Miniflare 5 beta to avoid known high-severity advisories in the latest stable Miniflare's image dependency. Its pinned Undici dependency is overridden to a patched 7.x release. Re-evaluate the beta and override when an audited stable release is available; these dependencies are used for development and tests, not included in the API bundles.

## Local setup and commands

Install Node.js 22.18 or later within major version 22 and npm 10 or later. Node.js 22.22.2 and npm 10.9.7 were used for validation. From the repository root in a clean checkout:

```sh
npm ci
npm run typecheck
npm test
npm run test:graph
npm run build
```

`npm test` runs the API unit, Node HTTP integration, and workerd tests. `npm run test:graph` checks Nx affected selection for isolated web and API changes and for each shared package. `npm run build` builds the web app, emits Node and Worker API bundles under `dist/apps/api`, and type-checks the remaining projects. PR validation runs these commands and type checking; lint and format checks remain outstanding.

To run the scaffold web page locally, execute `npm run dev --workspace @rent-hub/web` from the repository root and visit `http://localhost:3000`. To run the API, first build it with `npx nx run api:build`, then run `node dist/apps/api/node.mjs` and visit `http://127.0.0.1:3001/api/v1/health`. `PORT` optionally selects an integer port from 1 to 65535. Stop either server with Ctrl+C. No production credentials are required.

Next.js automatic agent-rule file generation is disabled so starting the web server does not modify the working tree; follow the repository's `AGENTS.md` and the installed Next.js documentation when working on the web app.

## Workspace layout

- `apps/web`: Next.js client; depends on `packages/localization`.
- `apps/api`: application health use case, Web Request/Response boundary, logging adapter, and Node/Worker entry points; depends on `packages/contracts`.
- `packages/contracts`: initial health response contract used by the API.
- `packages/localization`: initial Portuguese UI messages used by the web app.
- `scripts`: bootstrap PR validation and affected-graph verification.

Nx models each shared package's actual consumers. Neither existing package is currently consumed by both apps; cross-app shared-package selection will need verification when such a dependency exists. Nx cache correctness and affected quality checks remain work for the quality foundation.

## Planned foundation

The first implementation phase should add:

- npm workspace configuration and strict TypeScript.
- Nx project/task configuration for affected checks, builds, and deployments.
- ESLint and Prettier configuration.
- Vitest and Playwright configuration appropriate to the applications.
- Husky hooks and Commitlint.
- Full local Cloudflare-compatible data and storage adapters.
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

The PR workflow validates each PR commit subject and the PR title, including the GitHub squash suffix. It uses `node --test scripts/validate-commit-messages.test.cjs` to test the validator, installs dependencies, and runs the current type, test, affected-graph, and build checks. A PR check cannot validate edits made to the squash message at merge time. A GitHub-side commit metadata restriction was rejected by the current repository configuration, so the person merging must check the final subject. The existing administrator bypass also remains in place.

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
