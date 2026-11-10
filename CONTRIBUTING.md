# Contributing

This repository is in its planning and foundation phase. Follow this guide as implementation is added.

## Workflow

1. Review the relevant product and technical documentation.
2. Create a feature branch from `main` using `rent-xxxxx`, where `xxxxx` is a five-digit sequential feature number.
3. Implement the change in the appropriate application or package and add tests.
4. Update related documentation and the glossary.
5. Run the relevant local checks.
6. Commit using `type(rent-xxxxx): concise lowercase description`.
7. Open a pull request targeting `main` and select exactly one release type: Major, Minor, or Patch.
8. Pass PR validation and obtain one approval before merging.

The commit identifier sequence is separate from feature-branch numbering. Its collision-safe allocation and validation mechanism must be decided before commit hooks enforce it.

## `main` branch policy

The active `Protect main` ruleset currently:

- Require pull requests; block direct pushes and branch deletion.
- Require one approving review.
- Block force pushes.
- Allow the repository owner/admin to bypass these rules.

The `execute-pr-validation.yml` workflow currently checks the PR release selection and patch whitespace. Its check must be added to this ruleset after the workflow has run. Expand the workflow to run Nx lint, format, type, test, and build tasks when the application workspace is added.

## Checks

The planned checks include formatting, linting, type checking, unit tests, relevant integration tests, and build validation. Nx affected-task selection should avoid rerunning unrelated app tasks. Exact commands will be documented after the workspace is scaffolded.

## Documentation

Documentation is part of each change, not a follow-up task. Remove obsolete active instructions when behavior changes; keep release history in `CHANGELOG.md`.

## License

The repository is public but has no open-source license. Do not assume that public visibility grants permission to reuse its contents.
