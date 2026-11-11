# Development Workflow

## Current status

The foundation is in progress. The initial web page and API health handler are scaffolding, not business features. The API build currently type-checks only; it is not a deployable artifact.

Node API serving, actual Worker runtime tests, local data services, and a Next.js-on-Workers prototype remain to be implemented and verified.

`npm audit` currently reports a moderate-severity development dependency advisory in the Nx and TypeScript ESLint minimatch chains; production dependencies reported no advisories during this validation. Track and re-evaluate the advisory before considering the foundation complete.

## Local setup and commands

Install Node.js 24 LTS (24.11 or later, below 25) and npm 11 or later. Node.js 24.22.3 and npm 11.19.1 were used for validation. From the repository root in a clean checkout:

```sh
npm ci
npx playwright install chromium
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:graph
npm run test:e2e
npm run build
```

`npm test` runs the available API handler tests. `npm run test:graph` checks Nx affected project and target selection for isolated web and API changes and for each shared package. `npm run test:e2e` starts the web app and runs a Chromium smoke test. `npm run build` builds the web app and type-checks the remaining projects; it does not produce an API server or deployment artifact. PR validation checks repository-wide formatting and linting, and runs affected lint, type, unit, browser, and build targets using the PR base and head. The hand-maintained UI concept HTML is excluded from automatic formatting.

To run the scaffold web page locally, execute `npm run dev --workspace @rent-hub/web` from the repository root and visit `http://localhost:3000`. Stop the server with Ctrl+C. There is no local API server yet, and no environment variables or production credentials are required for these commands.

Next.js automatic agent-rule file generation is disabled so starting the web server does not modify the working tree; follow the repository's `AGENTS.md` and the installed Next.js documentation when working on the web app.

## Workspace layout

- `apps/web`: Next.js client; depends on `packages/localization`.
- `apps/api`: Web Request/Response health handler and Worker-shaped entry; depends on `packages/contracts`.
- `packages/contracts`: initial health response contract used by the API.
- `packages/localization`: initial Portuguese UI messages used by the web app.
- `scripts`: PR and hook validation, and affected-graph verification.

Nx models each shared package's actual consumers. Neither existing package is currently consumed by both apps; cross-app shared-package selection will need verification when such a dependency exists. Type checks, lint, and unit tests use Nx caching with declared workspace and runtime inputs; the Next.js build and browser test are not cached because their environment-dependent behavior has not been fully modeled.

## Planned foundation

The first implementation phase should add:

- npm workspace configuration and strict TypeScript.
- Nx project/task configuration for affected deployments.
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

## Git hooks

- **Pre-commit:** `git diff --cached --check` rejects whitespace errors and conflict markers; `node scripts/check-staged.ts` checks formatting for staged files and rejects partially staged files; `npm run lint` lints the workspace. Partially staged files must have their remaining changes staged or set aside first, so checks cannot validate a different version from the commit.
- **Commit-msg:** Commitlint enforces the format, allowed type, lowercase description, and description length without allocating identifiers; PR validation uses the same Commitlint configuration.
- **Pre-push:** `node scripts/push-policy.ts` validates the branch refs; `git merge-base` selects the local `origin/main` base. `tsc` type-checks the scripts and `node --test` tests their policies; `nx affected` runs unit tests and type checks for affected projects, and `npm run build` builds the workspace. Generated build files remain ignored by Git. Fetch `origin/main` before pushing; browser tests run in PR validation rather than this hook.

Husky installs the hooks during `npm ci`; PR validation remains authoritative. Local hooks do not access PROD resources.

The PR workflow validates each PR commit subject and the PR title, including the GitHub squash suffix. It uses `node --test scripts/validate-commit-messages.test.ts` to test the validator. A PR check cannot validate edits made to the squash message at merge time. A GitHub-side commit metadata restriction was rejected by the current repository configuration, so the person merging must check the final subject. The existing administrator bypass also remains in place.

The remaining scripts use TypeScript with Node 24's built-in type stripping, and `scripts/tsconfig.json` provides explicit type checking:

- `check-staged.ts` selects staged files and verifies that the files checked match the versions being committed.
- `push-policy.ts` validates each branch ref passed by Git and reports whether a branch needs checks.
- `commitlint.config.cjs` defines the subject rules used for commits and PR validation; the PR workflow adds the squash-title suffix before checking the title.
- `hooks.test.ts`, `validate-commit-messages.test.ts`, and `affected-graph.test.ts` test the hook policy, subject rules, and Nx project/target selection.

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
