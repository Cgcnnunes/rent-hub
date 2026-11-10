# Deployment and Environments

## Status

No application deployment workflows or Cloudflare resources have been created yet. This document defines the intended behavior; it is not evidence that deployments are available.

The GitHub `main` ruleset currently requires a pull request and one approval, blocks direct pushes, deletions, and force pushes, and allows repository admins to bypass. The `execute-pr-validation.yml` workflow exists for release-selection and whitespace checks; its status check still needs to be added to the ruleset after the first workflow run. Nx app-quality tasks will be added when application packages exist.

## Environments

| Environment | Purpose | Isolation |
|---|---|---|
| TEST | Integration, acceptance, authentication, API, smoke, and deployment validation | Dedicated provider account, users, database, storage, and secrets |
| PROD | Live application and controlled production verification | Separate provider account, users, database, storage, and secrets |

Do not share databases, buckets, authentication secrets, API credentials, email credentials, production configuration, or customer data across TEST and PROD. Synthetic users must use normal authentication and be clearly controlled.

## Hosting and data location

Cloudflare Free is the initial preference for both the website and API. D1 is the initial relational database and R2 the initial private object store. Confirm current free-tier limits, available storage-location controls, and runtime compatibility before production provisioning.

Choose EU storage options where supported. The project does not promise that requests are processed only in the EU. Cloudflare Worker code may execute globally on the selected plan. Do not describe this preference as a legal-compliance guarantee.

The Next.js deployment adapter remains undecided pending a compatibility test. The API uses separate Node.js and Cloudflare Worker entry points around shared application behavior.

## Affected-app deployment

The website and API are independently deployable:

- A web-only change publishes only the website.
- An API-only change publishes only the API.
- A shared package change runs checks/builds and publishes every dependent app.
- Unaffected tasks should be skipped or restored from cache through Nx.

The Nx project graph, task inputs/outputs, changed-file base/head, and deployment filters must be tested so that shared-package changes cannot be missed.

## Required workflows

Create exactly three principal GitHub Actions workflows:

### `execute-pr-validation.yml`

- Run for pull requests targeting `main`.
- Scope concurrency to a pull request and cancel the older run for that same PR.
- Run affected builds and relevant lint, format, type, unit, integration, and other required checks.
- Reject a missing or multiple PR release-type selection.

### `deploy-to-test.yml`

- Run after changes merge into `main`.
- Run relevant validation, deploy affected apps to TEST, and run smoke/API/deployment verification.
- Queue deployments so two runs cannot deploy concurrently to the same TEST resources.
- GitHub Actions concurrency is not guaranteed FIFO and may replace a pending run. A concurrency group alone does not satisfy the queue requirement; implement and test a durable serialization mechanism.
- Generate release notes and create a GitHub pre-release tag only after successful deployment and required verification.

### `deploy-to-prod.yml`

- Run only through `workflow_dispatch`, with a Git tag selected as the workflow reference.
- Reject `main` and all branch references; validate that the tag exists and is eligible for PROD.
- Deploy the selected validated tag, run production verification/smoke tests, then promote the corresponding GitHub pre-release to a release.
- Keep TEST and PROD credentials separate and protect GitHub environments as appropriate.

## Production history and rollback

- A successfully deployed tag must not be deployed to PROD again.
- A failed deployment must remain retryable.
- Older eligible tags must remain deployable for rollback; do not impose a latest-tag-only rule.
- A successful older-tag deployment is an intentional rollback.
- Use durable deployment history (for example, GitHub deployment/environment records or equivalent metadata). A workflow run's existence alone is not proof of successful deployment.
- Never promote a release before a successful PROD deployment.
