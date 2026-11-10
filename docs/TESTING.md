# Testing Strategy

Testing is part of the architecture and must accompany each feature. Exact commands and CI task names will be added when the npm/Nx workspace is implemented.

## Test levels

### Unit

Cover domain rules, entities/value objects, application use cases, validation, calculations/formatting, and important frontend behavior. Tests should be deterministic and independent of external services.

### Integration

Test application-to-persistence interactions, repositories, authentication/token handling, storage adapters, external-service adapters, and API-to-use-case behavior. Use a local D1-compatible database or equivalent test database.

### API

Cover request validation, authentication, per-account/per-area authorization, success and error responses, persistence interactions, and important business flows.

### End-to-end

Cover critical flows through the web app and API, including registration/email verification, login, property creation, adding tenants, contract creation, payment recording, expense registration, and document upload/retrieval.

### Smoke and deployment verification

Run smoke tests after each deployment. Check application availability and critical API routes. TEST also runs API tests and deployment verification.

## Runtime coverage

- Test shared business behavior in Node.js.
- Test Node and Cloudflare runtime adapters independently.
- Validate Cloudflare compatibility against the actual Worker runtime; Node-only success is insufficient.
- Verify authentication through its normal flow in TEST and PROD.
- Use controlled synthetic users/data for production smoke tests; never bypass authentication or modify customer records.

## Local test environment

The planned local setup must run the web app, API, database, migrations, mock data, test users, authentication, and test file uploads without using PROD resources.

## CI selection and caching

Nx should run tasks for changed projects and their dependents, while caching deterministic task outputs. Declare task inputs and outputs correctly. A change to a shared package must trigger all dependent app checks/builds; unrelated app changes should not.

PR validation is authoritative and must include type checking, linting, formatting validation, unit tests, relevant integration tests, and build validation. Do not bypass a failing quality gate to make a workflow pass.
