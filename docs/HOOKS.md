# Git hooks: a beginner's guide

Git hooks are commands that Git runs automatically at certain points, such as
before a commit or a push. Rent Hub uses [Husky](https://typicode.github.io/husky/)
to install the hooks in [`.husky/`](../.husky/). They help catch problems on
your computer before the pull request (PR) runs its own checks.

## Setup and useful terms

From the repository root, install Node.js 24 LTS (at least 24.11, but below 25)
and npm 11 or later, then run `npm ci`. The `prepare` script runs `husky` during
installation. You can check the active versions with `node --version` and
`npm --version`.

- **Working tree:** the files you are editing.
- **Staging area:** the snapshot selected for the next commit. `git add` updates
  that snapshot; it does not create the commit.
- **Partially staged file:** a file with some edits in the staging area and
  additional edits only in the working tree.
- **Affected projects:** the projects Nx selects based on changed files and
  project dependencies.
- **`origin/main`:** your local record of the remote `main` branch. Update it
  with `git fetch origin` before pushing.

For example:

```sh
git status
git add path/to/file
git commit -m "fix(rent-00001): correct the example"
git fetch origin
git push
```

The identifier in the example is illustrative. The commit identifier sequence
is separate from branch numbering; there is no automatic allocator.

## Before a commit: `pre-commit`

Git runs [`.husky/pre-commit`](../.husky/pre-commit) before creating the commit.
`set -e` makes the hook stop if a command fails. The commit is not created until
the commands succeed.

1. `git diff --cached --check` examines the staged changes for whitespace
   errors and conflict markers. `--cached` means Git checks the staging area,
   not all files in your working tree.
2. `node scripts/check-staged.ts` runs
   [`check-staged.ts`](../scripts/check-staged.ts). It finds staged added,
   copied, modified, and renamed files that still exist, rejects partially
   staged files, and runs Prettier in **check** mode on those files. It does not
   change files. Files Prettier ignores and file types it does not recognize
   are not formatting-checked.
3. `npm run lint` runs ESLint on the workspace with warnings treated as errors.
   Unlike the formatting check, this reads the working tree, including
   unstaged files; it is not limited to staged files.

Why reject partially staged files? Prettier reads the working-tree file, but
Git commits its staged snapshot. If the two differ, a formatting check could
pass for content that is not actually being committed. If the hook reports a
partially staged file, review it with `git diff` and `git diff --cached`, then
stage the remaining edits with `git add path/to/file`, or safely set the
unstaged edits aside before committing. Do not discard changes you need.

If formatting fails, format the affected files, review the changes, and stage
them again. `npm run format` formats the whole supported workspace; review its
changes before staging. The hook itself does not run unit tests; those run
before a branch push and in PR validation.

## Checking the message: `commit-msg`

After you provide a commit message, Git runs
[`.husky/commit-msg`](../.husky/commit-msg):

```sh
npx --no -- commitlint --edit "$1"
```

`$1` is the message file supplied by Git. `--edit` tells Commitlint to read
that file, and `npx --no --` uses the locally installed tool without prompting
to install it. The rules are defined in
[`commitlint.config.ts`](../commitlint.config.ts):

- Use `type(rent-xxxxx): description`, with exactly five digits.
- The type must be `feat`, `chore`, `refactor`, `fix`, or `doc`.
- The description must not be blank, must be lowercase, and can contain at
  most 120 characters.

For example, `fix(rent-00001): correct the example` is valid, while
`fix(rent-1): Correct the example` is not. Fix the message and retry if the
hook reports an error.

## Before a push: `pre-push`

Git runs [`.husky/pre-push`](../.husky/pre-push) before sending refs to the
remote. A **ref** identifies what is being pushed, such as a branch or tag.
`set -e` stops the hook when a command fails. For a branch push:

1. `node scripts/push-policy.ts` reads the refs Git supplies through standard
   input. [`push-policy.ts`](../scripts/push-policy.ts) rejects pushes to
   `main` and branch names outside `rent-` followed by five digits. Both the
   local source and remote destination must follow that pattern, and the source
   must be the currently checked-out branch. A branch deletion is rejected
   because it has no valid local source. The local and remote feature-branch
   names do not have to be identical. If a valid branch update is present, the
   script prints `branch`, so the hook knows to run the remaining checks.
   Non-branch refs such as tags are not validated by this branch policy; a
   tag-only push does not run the remaining branch checks.
2. `git merge-base origin/main HEAD` finds a common ancestor of the local
   `origin/main` reference and the current commit (`HEAD`). The hook stores
   this commit as `base` for Nx. Run `git fetch origin` first so the comparison
   uses an up-to-date `origin/main`.
3. `npx tsc -p scripts/tsconfig.json` type-checks the TypeScript scripts and
   Commitlint configuration. It checks types without producing JavaScript files.
4. `node --test scripts/validate-commit-messages.test.ts scripts/hooks.test.ts`
   runs the tests for commit-message rules and hook policies.
5. `npx nx affected -t test typecheck --base="$base" --head=HEAD` runs the
   available unit-test and type-check targets for affected projects. Nx can
   reuse cached results when the declared inputs match.
6. `npm run build` runs the build targets across the workspace, not just
   affected projects. Generated outputs such as `.next/` are ignored by Git.
   The current API build only type-checks; it does not produce a server.

Browser tests do not run in this hook. The PR workflow runs affected browser
tests separately. The push checks compare commits, not uncommitted changes, so
commit the work you intend to push before relying on affected selection.

## Other files used by the checks

| File                                                                                      | Purpose                                                                                                                          |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [`scripts/hooks.test.ts`](../scripts/hooks.test.ts)                                       | Tests branch restrictions and Git's staged whitespace/conflict checks.                                                           |
| [`scripts/validate-commit-messages.test.ts`](../scripts/validate-commit-messages.test.ts) | Runs Commitlint against valid and invalid examples, including the squash-title length limit.                                     |
| [`scripts/affected-graph.test.ts`](../scripts/affected-graph.test.ts)                     | Checks that Nx selects expected projects and targets for web, API, and shared-package changes. Run it with `npm run test:graph`. |
| [`scripts/ci-projects.ts`](../scripts/ci-projects.ts)                                     | Uses Nx's affected-project graph to select the PR app matrix and shared-project checks.                                          |
| [`scripts/ci-projects.test.ts`](../scripts/ci-projects.test.ts)                           | Tests how the PR workflow separates affected apps and shared projects.                                                           |
| [`scripts/tsconfig.json`](../scripts/tsconfig.json)                                       | Configures type-checking for the scripts and Commitlint config.                                                                  |
| [`scripts/package.json`](../scripts/package.json)                                         | Marks the scripts directory as ES modules so Node can run its TypeScript files.                                                  |

Node 24 runs these TypeScript files using built-in type stripping; that does
not check their types, which is why the separate `tsc` command matters.

## If a check fails

Read the first error message, fix the problem, and retry the commit or push.
For a formatting or lint error, review and stage your fixes. For a message
error, correct the commit subject. For a branch error, check the current branch
with `git branch --show-current` and push from an appropriately named feature
branch. If `origin/main` is missing or outdated, run `git fetch origin`.

Local hooks are helpful but are not the final authority: the
[`PR validation` workflow](../.github/workflows/execute-pr-validation.yml)
runs on GitHub and also checks the PR title, every PR commit subject, the
release-type selection, and affected browser tests. The title is checked with
GitHub's ` (#number)` squash suffix included. A check cannot validate a squash
message edited at merge time, so the person merging must check that subject.
See the [development workflow](DEVELOPMENT.md) for all local commands.
