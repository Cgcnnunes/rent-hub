# Security and Data Handling

## Authentication

Use custom authentication that does not require a hosting provider or external identity provider. The planned flow includes self-service registration, email verification before app use, login, password recovery, secure password hashing, signed JWT or equivalent tokens, and session/token lifecycle management.

The implementation must define token claims, expiry, refresh, revocation, browser transport, and CSRF protections before authentication is released. Protect authenticated API endpoints and enforce authorization on the backend.

## Account authorization

- Every business record must be scoped to an account.
- Users can belong to multiple accounts; account context must be explicit for each operation.
- Enforce No access, Viewer, and Editor permissions per application area at the API boundary.
- Only the account owner can invite/remove members or change access.
- Editors may add, change, and delete records only in areas where they have Editor access.
- Keep deletions recoverable for 30 days; permanently remove expired deleted records.
- Log relevant access and mutation activity without putting unnecessary personal or secret data in logs.

## Environment and secret isolation

- Use separate TEST and PROD provider accounts/resources where supported.
- Keep authentication keys, JWT signing secrets, API keys, email credentials, and configuration isolated per environment.
- Never commit secrets or expose them in logs.
- Production synthetic users must use the real authentication flow and must not act as an authentication bypass.
- Do not use real customer data in local development or automated tests.

## Personal data and files

The application will handle tenant information, contracts, payments, and private documents. Use private object storage, controlled application-level upload/download/delete operations, and least-privilege access. Store file metadata and keys in the database, not file bytes.

The current preference is EU data storage where Cloudflare Free supports it. EU-only request processing is not a launch guarantee. Verify each service's current location controls, plan availability, and provider terms before production use. This document does not certify legal compliance.

## Public repository

The source repository is intended to be public without an open-source license. Do not add a license without authorization. Never commit secrets, private customer data, or production credentials.
