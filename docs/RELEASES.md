# Releases and Versioning

## Versioning

Use Semantic Versioning with Git tags in the form `vMAJOR.MINOR.PATCH`:

- **Major:** increment MAJOR and reset MINOR and PATCH to zero.
- **Minor:** increment MINOR and reset PATCH to zero.
- **Patch:** increment PATCH.

The pull request must select exactly one release type: Major, Minor, or Patch. PR validation must reject missing or multiple selections.

For a release containing multiple merged PRs, apply the highest selected type once: Major takes precedence over Minor, which takes precedence over Patch. Calculate the next version from the latest successfully created release or TEST pre-release, even if the latter has not yet been deployed to PROD. For example, Patch and Minor changes after `v1.2.3` produce `v1.3.0`; a further Patch after a successful `v1.3.0` TEST pre-release produces `v1.3.1`. Include all PRs in that release in its notes.

## Release lifecycle

1. Merge a validated pull request into `main`.
2. Deploy affected applications to TEST and run required verification.
3. After successful TEST deployment and verification, create a GitHub pre-release tag with notes generated from merged PRs and their selected release types.
4. Manually dispatch PROD deployment using an eligible Git tag.
5. After successful PROD deployment and verification, promote the corresponding pre-release to a GitHub release without changing the tag.
6. Update `CHANGELOG.md` as the historical record of released changes.

Failed deployments do not create or promote a successful release. A failed PROD attempt remains retryable. An explicit rollback can redeploy an older release previously successful in PROD, subject to the safeguards in [Deployment and Environments](DEPLOYMENT.md); it does not create or promote a duplicate release.

## Release notes

Release notes should summarize merged pull requests, reflect the selected release type, and include relevant migration, deployment, or operational notes. The exact automation and formatting will be established with the CI/CD implementation.
