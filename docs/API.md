# API Contracts

## Status

No API endpoints are implemented yet. Route paths, versioning, and the published contract format remain to be defined before the first endpoint is released.

## Contract principles

- The API is a delivery boundary for application use cases, not the owner of business rules.
- Define explicit request and response types; do not expose database entities directly.
- Validate all external input at the boundary.
- Use consistent success and error response shapes and document status codes.
- Protect authenticated endpoints and enforce account membership and per-area access on the backend.
- A user's selected account must be explicit and validated for each operation; never trust a client-supplied account ID without checking membership.
- Keep provider-specific and runtime-specific behavior out of public contracts.
- Document authentication, authorization, pagination, filtering, and error behavior with each feature.

## Planned API areas

The API will support the product modules in [`PRODUCT.md`](PRODUCT.md): properties, tenants, contracts, payments, expenses, maintenance, documents, notifications, reports, settings, and activity history, as well as registration, verification, login, password recovery, account membership, and invitations.

Exact resources and operations will be added with their feature implementation. Do not invent routes or claim an API contract is available before it is implemented and tested.
