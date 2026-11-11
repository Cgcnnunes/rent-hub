# Development Workflow

## Current status

The foundation is in progress. The initial web page and API health endpoint are scaffolding, not business features. The API build currently type-checks only; it is not a deployable artifact.

The API has a local Node server and a Worker entry tested in Workerd. Local data services and a Next.js-on-Workers prototype remain to be implemented and verified.

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

`npm test` runs the API unit, local Node HTTP, and Workerd integration tests. `npm run test:graph` checks Nx affected project and target selection for isolated web and API changes and for each shared package. `npm run test:e2e` starts the web app and runs a Chromium smoke test. `npm run build` builds the web app and type-checks the remaining projects; it does not produce an API deployment artifact. PR validation selects affected projects from the PR base and head, checks each affected app in a parallel matrix, and checks affected shared projects separately. Each selected project's lint, type, unit-test, and build targets run on the whole project, not just changed files; affected apps with a browser target also run it. Formatting normally checks changed files; changes to formatting configuration or dependency manifests trigger a workspace-wide check. Root tooling and metadata checks run independently. The hand-maintained UI concept HTML is excluded from automatic formatting.

To run the scaffold web page locally, execute `npm run dev --workspace @rent-hub/web` from the repository root and visit `http://localhost:3000`. To run the API, use `npm run dev --workspace @rent-hub/api` and visit `http://127.0.0.1:8787/api/v1/health`. Stop either server with Ctrl+C. These commands do not require environment variables or production credentials.

Next.js automatic agent-rule file generation is disabled so starting the web server does not modify the working tree; follow the repository's `AGENTS.md` and the installed Next.js documentation when working on the web app.

## Workspace layout

- `apps/web`: Next.js client; depends on `packages/localization`.
- `apps/api`: application health use case, Web Request/Response boundary, Node HTTP and Worker entry points, and logging adapter; depends on `packages/contracts`.
- `packages/contracts`: initial health response contract used by the API.
- `packages/localization`: initial Portuguese UI messages used by the web app.
- `scripts`: PR and hook validation, and affected-graph verification.

Nx models each shared package's actual consumers. Neither existing package is currently consumed by both apps; cross-app shared-package selection will need verification when such a dependency exists. Type checks and lint use Nx caching with declared workspace and runtime inputs. API tests are not cached because they start local Node and Workerd runtimes; the Next.js build and browser test are not cached because their environment-dependent behavior has not been fully modeled.

Miniflare is a development-only Workerd test harness; it does not connect to Cloudflare or deploy resources. The root overrides pin patched `sharp` and Miniflare's `undici` until Miniflare's pinned dependencies are updated. Re-evaluate the overrides when upgrading it.

GitHub Actions caches npm's download cache using the lockfile through `setup-node`; every job still runs `npm ci` to install dependencies. It does not cache `node_modules` or persist Nx's local task cache between runners. Nx affected selection decides which projects need validation; its task cache is separate and can reuse matching deterministic results where a cache is available. Remote or persistent CI task caching is not configured.

## Planned foundation

The remaining foundation work includes:

- Deployment workflows and Nx project/task configuration for affected deployments.
- Runtime validation for future provider bindings and API features beyond health.
- Local database, migrations, and test data that do not use PROD resources.

## Branch and pull request workflow

1. Review product, architecture, and feature documentation.
2. Create a feature branch from `main` using `rent-xxxxx` with a five-digit sequential feature number.
3. Implement the change in the correct application/package and add tests.
4. Update affected docs and the glossary.
5. Run relevant local checks and verify runtime compatibility where applicable.
6. Commit as `type(RENT-xxxxx): concise lowercase description`, using the branch's five-digit number.
7. Open a pull request to `main`, selecting exactly one of Major, Minor, or Patch. Its title must follow the commit format and leave room for GitHub's ` (#number)` suffix within the 120-character description limit.
8. Pass PR validation and obtain one approval.
9. Squash and merge using a correctly formatted commit subject; merged changes are then considered for TEST deployment. Do not edit the final squash subject to bypass the convention.

For example, `rent-00007` uses the scope `RENT-00007` for every commit and the PR title. Feature-branch number allocation is not automated.

Allowed commit types are `feat`, `chore`, `refactor`, `fix`, and `doc`. The lowercase description must not exceed 120 characters.

## Git hooks

For a beginner-friendly explanation of each hook, command, and supporting
script, see the [Git hooks guide](HOOKS.md).

- **Pre-commit:** `git diff --cached --check` rejects whitespace errors and conflict markers; `node scripts/check-staged.ts` checks formatting for staged files and rejects partially staged files; `npm run lint` lints the workspace. Partially staged files must have their remaining changes staged or set aside first, so checks cannot validate a different version from the commit.
- **Commit-msg:** Commitlint enforces the format, matching uppercase branch scope, allowed type, lowercase description, and description length; PR validation uses the same rules against the PR head branch.
- **Pre-push:** `node scripts/push-policy.ts` validates the branch refs; `git merge-base` selects the local `origin/main` base. `tsc` type-checks the scripts and `node --test` tests their policies; `nx affected` runs unit tests and type checks for affected projects, and `npm run build` builds the workspace. Generated build files remain ignored by Git. Fetch `origin/main` before pushing; browser tests run in PR validation rather than this hook.

Husky installs the hooks during `npm ci`; PR validation remains authoritative. Local hooks do not access PROD resources.

The PR workflow validates each PR commit subject and the PR title, including the GitHub squash suffix. It uses `node --test scripts/validate-commit-messages.test.ts` to test the validator. A PR check cannot validate edits made to the squash message at merge time. A GitHub-side commit metadata restriction was rejected by the current repository configuration, so the person merging must check the final subject. The existing administrator bypass also remains in place.

The remaining scripts use TypeScript with Node 24's built-in type stripping, and `scripts/tsconfig.json` provides explicit type checking:

- `check-staged.ts` selects staged files and verifies that the files checked match the versions being committed.
- `push-policy.ts` validates each branch ref passed by Git and reports whether a branch needs checks.
- `commitlint.config.ts` defines the subject rules used for commits and PR validation; locally it reads the current branch, while CI supplies `COMMIT_BRANCH` from the PR head. The PR workflow adds the squash-title suffix before checking the title.
- `ci-projects.ts` selects the app matrix and shared-project checks for PR validation.
- `hooks.test.ts`, `validate-commit-messages.test.ts`, `affected-graph.test.ts`, and `ci-projects.test.ts` test hook policy, subject rules, and Nx selection.

See the [script reference](../scripts/README.md) for invocation, inputs, and failure handling, and the [PR validation guide](workflows/execute-pr-validation/README.md) for the workflow's jobs and diagram.

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

Documentation is part of implementation. Keep active guides aligned with actual behavior, remove obsolete instructions when a feature changes, preserve released history in `CHANGELOG.md`, and update the glossary when introducing terms. Follow the [documentation standard](DOCUMENTATION.md) for workflow and script READMEs.
