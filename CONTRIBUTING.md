# Contributing

This repository is in its planning and foundation phase. Follow this guide as implementation is added.

## Workflow

1. Review the relevant product and technical documentation.
2. Create a feature branch from `main` using `rent-xxxxx`, where `xxxxx` is a five-digit sequential feature number.
3. Implement the change in the appropriate application or package and add tests.
4. Update related documentation and the glossary.
5. Run the relevant local checks.
6. Commit using `type(rent-xxxxx): concise lowercase description`.
7. Open a pull request targeting `main`, use the commit format for its title, and select exactly one release type: Major, Minor, or Patch.
8. Pass PR validation and obtain one approval before merging.
9. Squash and merge using a correctly formatted final commit subject.

The commit identifier sequence is separate from feature-branch numbering. Its collision-safe allocation and validation mechanism must be decided before commit hooks enforce it.

Use `feat`, `chore`, `refactor`, `fix`, or `doc` as the commit type. The lowercase description must not exceed 120 characters. See the [development workflow](docs/DEVELOPMENT.md) for planned hook responsibilities.

## `main` branch policy

The active `Protect main` ruleset currently:

- Require pull requests; block direct pushes and branch deletion.
- Require one approving review.
- Require the `PR validation` status check.
- Block force pushes.
- Allow the repository owner/admin to bypass these rules.

GitHub is configured to allow only squash merges, using the PR title as the default squash subject. The merger must ensure the final subject still follows the convention: PR validation cannot check edits made at merge time. A server-side commit metadata restriction was rejected by the current repository configuration.

The `execute-pr-validation.yml` workflow checks the PR release selection, commit subjects, PR title, patch whitespace, formatting, lint, and affected Nx types, tests, and builds. The PR title must leave space for GitHub's ` (#number)` suffix within the description's 120-character limit.

## Checks

Run the setup and checks documented in the [development workflow](docs/DEVELOPMENT.md). Install Chromium before running browser tests or pushing a web change. Broader integration and Worker runtime tests remain planned.

## Documentation

Documentation is part of each change, not a follow-up task. Remove obsolete active instructions when behavior changes; keep release history in `CHANGELOG.md`.

## License

The repository is public but has no open-source license. Do not assume that public visibility grants permission to reuse its contents.
