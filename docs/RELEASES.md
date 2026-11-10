# Releases and Versioning

## Versioning

Use Semantic Versioning with Git tags in the form `vMAJOR.MINOR.PATCH`:

- **Major:** increment MAJOR and reset MINOR and PATCH to zero.
- **Minor:** increment MINOR and reset PATCH to zero.
- **Patch:** increment PATCH.

The pull request must select exactly one release type: Major, Minor, or Patch. PR validation must reject missing or multiple selections.

## Release lifecycle

1. Merge a validated pull request into `main`.
2. Deploy affected applications to TEST and run required verification.
3. After successful TEST deployment and verification, create a GitHub pre-release tag with notes generated from merged PRs and their selected release types.
4. Manually dispatch PROD deployment using an eligible Git tag.
5. After successful PROD deployment and verification, promote the corresponding pre-release to a GitHub release without changing the tag.
6. Update `CHANGELOG.md` as the historical record of released changes.

Failed deployments do not create or promote a successful release. A failed PROD attempt remains retryable. Older eligible releases remain deployable for intentional rollback.

## Release notes

Release notes should summarize merged pull requests, reflect the selected release type, and include relevant migration, deployment, or operational notes. The exact automation and formatting will be established with the CI/CD implementation.
