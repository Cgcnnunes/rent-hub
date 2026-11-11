# Scripts

These TypeScript files run from the repository root with Node 24's built-in
type stripping. Run `npm ci` first. Type stripping does not type-check: use
`npx tsc -p scripts/tsconfig.json` for that. [`package.json`](package.json)
marks this directory as ES modules; [`tsconfig.json`](tsconfig.json) sets
the script and Commitlint type-checking scope.

This index documents every executable and test script. Follow the
[documentation standard](../docs/DOCUMENTATION.md) when adding or changing one.

## check-staged.ts

### Purpose

[`check-staged.ts`](check-staged.ts) checks formatting for staged files while
preventing a partially staged file from being checked in a different state
from the one being committed.

### Invocation

Normally called by [pre-commit](../.husky/pre-commit) after Git's staged
whitespace check. Run manually with `node scripts/check-staged.ts`.

### Inputs and outputs

Reads Git's staged added, copied, modified, and renamed files that still
exist, plus their working-tree state. Prettier reports its results to the
terminal. It does not modify or stage files.

### Behavior

If there are matching files, reject unstaged changes in any of them, then run
Prettier in check mode. Prettier-ignored and unrecognized file types are not
format-checked. With no matching files, there is nothing to check.

### Failure and verification

Git, Prettier, or a partially staged file can cause a nonzero exit. Review
`git diff` and `git diff --cached` before staging remaining changes or safely
setting them aside. Format and restage files if necessary. The hook guide
describes the full pre-commit sequence; there is no dedicated automated test
of this script's partial-staging or formatting behavior.

### Related documentation

[Git hooks guide](../docs/HOOKS.md#before-a-commit-pre-commit).

## push-policy.ts

### Purpose

[`push-policy.ts`](push-policy.ts) validates branch updates supplied by Git
and tells the pre-push hook whether to run branch checks.

### Invocation

Normally called by [pre-push](../.husky/pre-push); Git supplies ref updates on
standard input. It can also be imported by its tests.

### Inputs and outputs

Reads Git's pre-push ref lines and the current symbolic branch. Prints
`branch` if a valid branch update is present; otherwise prints nothing.
It does not push or modify refs.

### Behavior

Both source and destination branch refs must match `rent-` plus five digits;
the source must be the current branch. Branch deletion and pushes to `main`
are rejected. Non-branch refs, including tags, are not checked by this policy.
Tag-only pushes therefore do not run the remaining branch checks.

### Failure and verification

Malformed input, an invalid branch update, or a Git error fails the script and
blocks the push. Check the current branch and destination. Run
`node --test scripts/hooks.test.ts` to test the policy and a real rejected
update.

### Related documentation

[Git hooks guide](../docs/HOOKS.md#before-a-push-pre-push).

## ci-projects.ts

### Purpose

[`ci-projects.ts`](ci-projects.ts) selects affected projects for the PR
workflow's app matrix and shared-project job.

### Invocation

The [PR workflow](../docs/workflows/execute-pr-validation/README.md) runs
`node scripts/ci-projects.ts` after installing dependencies. Tests import its
functions.

### Inputs and outputs

Requires `NX_BASE`, `NX_HEAD`, and `GITHUB_OUTPUT` when run directly. It
queries Nx's project graph, then appends `apps` and `packages` JSON outputs
to the file named by `GITHUB_OUTPUT`. Each app has `name` and `browser`
fields; `browser` indicates a `test-e2e` target. `packages` contains names of
affected non-app projects.

### Behavior

Projects whose root starts with `apps/` enter the app list; all other
affected projects enter the shared-project list, even without an app
consumer. Empty lists are valid. Nx uses the PR comparison and dependency
graph to determine affected projects.

### Failure and verification

Missing required environment variables, failed Nx commands, or invalid
project metadata fail the script. Inspect the discovery job's logs and Nx
graph. Run `node --test scripts/ci-projects.test.ts`; its graph cases run
against the current workspace.

### Related documentation

[PR validation](../docs/workflows/execute-pr-validation/README.md) and
[testing strategy](../docs/TESTING.md).

## hooks.test.ts

### Purpose

[`hooks.test.ts`](hooks.test.ts) tests the branch policy and Git's staged
whitespace/conflict checks.

### Invocation

Run `node --test scripts/hooks.test.ts`. Pre-push and PR validation also run it.

### Inputs and outputs

Uses Git, the current commit, and temporary Git repositories. Node's test
runner reports results; temporary files are removed by the test.

### Behavior

Checks allowed and rejected branch refs, invokes the policy for a push to
`main`, and verifies that `git diff --cached --check` rejects whitespace
errors and conflict markers.

### Failure and verification

An assertion or failed Git command fails the test. Read the failing case and
ensure Git is installed. It does not test the entire pre-commit hook or
`check-staged.ts`.

### Related documentation

[Git hooks guide](../docs/HOOKS.md).

## validate-commit-messages.test.ts

### Purpose

[`validate-commit-messages.test.ts`](validate-commit-messages.test.ts)
tests the actual Commitlint rules, not a separate message validator.

### Invocation

Run `node --test scripts/validate-commit-messages.test.ts`. Pre-push and PR
validation also run it.

### Inputs and outputs

Passes sample subjects to the installed Commitlint CLI using standard input;
Node's test runner reports results. It does not change commits.

### Behavior

Covers allowed types, invalid formats, lowercase descriptions, length limits,
and GitHub's squash suffix, including Unicode examples.

### Failure and verification

A mismatch with the expected Commitlint result fails an assertion. Check
[`commitlint.config.ts`](../commitlint.config.ts) and the failing example.

### Related documentation

[Commit message hook](../docs/HOOKS.md#checking-the-message-commit-msg).

## affected-graph.test.ts

### Purpose

[`affected-graph.test.ts`](affected-graph.test.ts) verifies Nx's affected
project and target selection for representative changes.

### Invocation

Run `npm run test:graph`, or `node --test scripts/affected-graph.test.ts`.
PR validation also runs it.

### Inputs and outputs

Runs Nx against the workspace graph with representative file paths. Node's
test runner reports results; the script does not change source files.

### Behavior

Checks web-only, API-only, contracts, and localization project selection,
plus representative build, browser-test, lint, and type-check target selection.
It checks selection, not execution of every target.

### Failure and verification

An unexpected graph or target list fails an assertion. Inspect the project
dependencies, target definitions, and the failing case.

### Related documentation

[Testing strategy](../docs/TESTING.md#ci-selection-and-caching).

## ci-projects.test.ts

### Purpose

[`ci-projects.test.ts`](ci-projects.test.ts) tests the PR workflow's affected
app and shared-project selection.

### Invocation

Run `node --test scripts/ci-projects.test.ts`. PR validation also runs it.

### Inputs and outputs

Imports `ci-projects.ts` and queries the real Nx workspace graph with
representative file paths. Node's test runner reports results.

### Behavior

Tests synthetic partitions and empty lists, then checks web, API, shared
package, global lint configuration, and documentation-only changes. It also
checks the web browser flag.

### Failure and verification

An unexpected selection or Nx failure fails the test. Review graph
dependencies, project roots and targets, and the failing case. This does not
test GitHub's matrix scheduling or aggregate status.

### Related documentation

[PR validation](../docs/workflows/execute-pr-validation/README.md).
