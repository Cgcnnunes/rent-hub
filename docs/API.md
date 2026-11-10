# API Specification

## Status and scope

This is the proposed HTTP contract for the first usable release. No API endpoints are implemented or tested yet. Routes and shared conventions below are design proposals to guide implementation; they are not a claim that a public API is available. Finalize field-level schemas and the open decisions at the end of this document with each feature before release.

The API serves the modules in [Product Requirements](PRODUCT.md). It uses the native Web `Request` and `Response` APIs and has no HTTP framework, as specified in [Architecture](ARCHITECTURE.md).

## Contract rules

### Base URL and representation

- Prefix application routes with `/api/v1`.
- Use HTTPS outside local development.
- Send and receive JSON as `application/json`, except document upload and download bodies.
- Use UTF-8. Reject malformed JSON and unsupported media types with the standard error format.
- Do not expose database rows or provider-specific details as public response types.
- Use explicit request and response DTOs. Reject unknown request fields rather than silently ignoring them.
- Use ISO 8601 date-time strings in UTC for instants. Use `YYYY-MM-DD` for calendar dates that do not represent an instant. Format dates, times, and amounts for `pt-PT` only at the presentation boundary.
- Represent monetary amounts as integer minor units with an ISO 4217 currency code (initially EUR); never use floating-point amounts in the contract.

### Success and error responses

Return a consistent success envelope:

```json
{
  "data": {}
}
```

List responses use `data` as an array and include pagination metadata:

```json
{
  "data": [],
  "page": {
    "nextCursor": null
  }
}
```

Errors use a stable machine-readable code and a safe message. `details` is optional and may contain field validation errors, but must not contain secrets or internal stack traces.

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request is invalid.",
    "details": {},
    "requestId": "..."
  }
}
```

Use the HTTP status that best describes the failure and keep error codes stable. At minimum, support:

| Status | Meaning |
|---|---|
| `400` | Malformed request or invalid query parameters |
| `401` | Missing, invalid, expired, or revoked authentication |
| `403` | Authenticated user lacks the required area permission or owner authority |
| `404` | Resource does not exist or is not visible in the selected account |
| `409` | Conflict with current state or a business invariant, including overlapping active contracts |
| `413` | Request or uploaded file exceeds the configured limit |
| `415` | Unsupported content type |
| `422` | Well-formed input that fails field or business validation |
| `429` | Rate limit exceeded |
| `500` | Unexpected server failure, with no internal details in the response |

Validation errors should identify the relevant input field where safe. Never return credentials, token values, private storage keys, or another account's data in an error.

### Authentication, account context, and authorization

- Authentication routes are not account-scoped. All other business routes include `/accounts/{accountId}` in the path so account context is explicit on every operation.
- Authenticate every protected request. The credential transport, token format, claims, expiry, refresh, revocation, and CSRF strategy remain open; see [Open decisions](#open-decisions).
- Verify account membership on every account-scoped request. A client-supplied account ID is a selector, not proof of access.
- Enforce authorization in the API, independent of UI visibility. Apply the built-in No access, Viewer, and Editor levels separately for each application area.
- Reads require Viewer or Editor access to the relevant area. Creates, updates, deletes, and restores require Editor access. Only the account owner may manage members, invitations, and account-level access.
- Do not let a user gain access by changing a resource ID, parent ID, account ID, or document association.
- Return `404` for resources outside the caller's account to reduce cross-account resource enumeration. Use `403` when the resource is in the account but the user lacks the required permission.

### Lists, filtering, and resource lifecycle

- List endpoints accept `limit` and an opaque `cursor`. The default and maximum page sizes must be configured consistently; invalid values return `400`.
- Filters and sort fields must be explicitly allow-listed per endpoint. Do not accept arbitrary SQL-like expressions or silently ignore invalid filters.
- Sort order must be deterministic, including a unique tie-breaker, so clients can page reliably.
- Business-record deletion is a soft delete. Deleted records are excluded from normal reads and lists and remain recoverable for 30 days.
- `GET /deleted-items` lists records the current user may restore. `POST /deleted-items/{resourceType}/{resourceId}/restore` restores a record before its recovery period expires and requires Editor access to its application area. Expired records cannot be restored; permanent cleanup is an internal scheduled operation, not a public endpoint.
- Child records, attached documents, and activity history must follow the deletion and restoration rules in [Database Model](DATABASE.md). Define cascade behavior for each resource before implementing its delete operation.

## Proposed endpoint inventory

All paths below are relative to `/api/v1`. Unless an operation is explicitly public, it requires authentication. The account-scoped authorization rules above apply to all `/accounts/{accountId}` routes. `{id}` placeholders are opaque identifiers; their concrete format is not part of this contract.

### Authentication and account access

| Method and path | Purpose | Access |
|---|---|---|
| `POST /auth/register` | Register a user and create their owner account; initiate email verification | Public |
| `POST /auth/email-verification/confirm` | Confirm an email verification challenge | Public |
| `POST /auth/email-verification/resend` | Resend verification without disclosing whether an address is registered | Public |
| `POST /auth/login` | Authenticate a verified user | Public |
| `POST /auth/logout` | Revoke the current session or refresh credential | Authenticated |
| `POST /auth/refresh` | Renew authentication under the selected token/session design | Authenticated or refresh credential |
| `POST /auth/password-reset/request` | Start password recovery; response must not disclose account existence | Public |
| `POST /auth/password-reset/confirm` | Set a new password using a valid recovery challenge | Public |
| `GET /me` | Return the authenticated user's profile and account memberships | Authenticated |
| `GET /accounts` | List accounts the authenticated user belongs to | Authenticated |
| `POST /invitations/accept` | Accept an invitation using its challenge; follow the normal authentication and email-verification flow | Authenticated |
| `GET /accounts/{accountId}/members` | List account members and their per-area access | Owner |
| `POST /accounts/{accountId}/invitations` | Invite a user and set initial per-area access | Owner |
| `POST /accounts/{accountId}/invitations/{invitationId}/resend` | Resend a pending invitation | Owner |
| `DELETE /accounts/{accountId}/invitations/{invitationId}` | Revoke a pending invitation | Owner |
| `PATCH /accounts/{accountId}/members/{userId}` | Change a member's per-area access | Owner |
| `DELETE /accounts/{accountId}/members/{userId}` | Remove a member from the account | Owner |

Registration creates an account owned by the registering user. An unverified user cannot use business endpoints. Invitation acceptance never bypasses registration, verification, or login requirements. Invitation expiry, duplicate invitations, ownership transfer, and last-owner behavior must be defined before implementation.

### Dashboard and portfolio

| Method and path | Purpose | Access |
|---|---|---|
| `GET /accounts/{accountId}/dashboard` | Return property and active-contract summaries, upcoming and overdue payments, recent activity, maintenance, and important dates | Viewer for each included area |

The dashboard response must be permission-aware: omit data from areas the member cannot access and do not infer or reveal their records through aggregate counts. Define the exact aggregation windows and behavior when the user has access to only some areas with the dashboard feature.

### Properties and tenants

| Method and path | Purpose | Access |
|---|---|---|
| `GET /accounts/{accountId}/properties` | List properties | Properties |
| `POST /accounts/{accountId}/properties` | Create a property | Properties |
| `GET /accounts/{accountId}/properties/{propertyId}` | Get property details and permitted related summaries | Properties |
| `PATCH /accounts/{accountId}/properties/{propertyId}` | Update a property | Properties |
| `DELETE /accounts/{accountId}/properties/{propertyId}` | Soft-delete a property | Properties |
| `GET /accounts/{accountId}/properties/{propertyId}/tenants` | List tenants associated with the property | Tenants |
| `POST /accounts/{accountId}/properties/{propertyId}/tenants` | Create tenant information associated with the property | Tenants |
| `GET /accounts/{accountId}/tenants/{tenantId}` | Get tenant details | Tenants |
| `PATCH /accounts/{accountId}/tenants/{tenantId}` | Update tenant details | Tenants |
| `DELETE /accounts/{accountId}/tenants/{tenantId}` | Soft-delete tenant information | Tenants |

Property payloads should cover the property details and address needed by the product. Tenant payloads should contain only the personal information needed to manage a tenancy. Exact fields, address structure, validation, and handling of tenant records referenced by historical contracts are to be specified with those features.

### Contracts

| Method and path | Purpose | Access |
|---|---|---|
| `GET /accounts/{accountId}/contracts` | List contracts; support property and status filters | Contracts |
| `POST /accounts/{accountId}/contracts` | Create a contract and associate it with a property and one or more tenants | Contracts |
| `GET /accounts/{accountId}/contracts/{contractId}` | Get contract details | Contracts |
| `PATCH /accounts/{accountId}/contracts/{contractId}` | Update contract details | Contracts |
| `DELETE /accounts/{accountId}/contracts/{contractId}` | Soft-delete a contract | Contracts |
| `PUT /accounts/{accountId}/contracts/{contractId}/tenants/{tenantId}` | Associate a tenant with the contract | Contracts and Tenants |
| `DELETE /accounts/{accountId}/contracts/{contractId}/tenants/{tenantId}` | Remove a tenant association | Contracts and Tenants |

The API must preserve historical contracts and reject overlapping active contracts for the same property unless a supported arrangement explicitly permits the overlap. Validate that the property and every tenant belong to the same account. Contract states, overlap exceptions, date-boundary rules, and immutable historical fields require feature-level definitions.

### Payments

| Method and path | Purpose | Access |
|---|---|---|
| `GET /accounts/{accountId}/contracts/{contractId}/payments` | List expected and received rent records for a contract | Payments |
| `POST /accounts/{accountId}/contracts/{contractId}/payments` | Record an expected or received payment manually | Payments |
| `GET /accounts/{accountId}/payments/{paymentId}` | Get a payment record | Payments |
| `PATCH /accounts/{accountId}/payments/{paymentId}` | Update a payment record | Payments |
| `DELETE /accounts/{accountId}/payments/{paymentId}` | Soft-delete a payment record | Payments |

Payment records must be linked to a contract and represent amount, due date, payment date where applicable, and status. The API must not initiate or claim to process payments; payment-provider integrations are out of first-release scope. Define whether partial receipts and multiple receipts against one expected payment are supported, which statuses are stored versus derived, and how overdue status is calculated.

### Expenses and maintenance

| Method and path | Purpose | Access |
|---|---|---|
| `GET /accounts/{accountId}/properties/{propertyId}/expenses` | List property expenses; support date and category filters | Expenses |
| `POST /accounts/{accountId}/properties/{propertyId}/expenses` | Record an expense | Expenses |
| `GET /accounts/{accountId}/expenses/{expenseId}` | Get an expense | Expenses |
| `PATCH /accounts/{accountId}/expenses/{expenseId}` | Update an expense | Expenses |
| `DELETE /accounts/{accountId}/expenses/{expenseId}` | Soft-delete an expense | Expenses |
| `GET /accounts/{accountId}/properties/{propertyId}/maintenance` | List maintenance records | Maintenance |
| `POST /accounts/{accountId}/properties/{propertyId}/maintenance` | Record a maintenance request or activity | Maintenance |
| `GET /accounts/{accountId}/maintenance/{maintenanceId}` | Get a maintenance record | Maintenance |
| `PATCH /accounts/{accountId}/maintenance/{maintenanceId}` | Update status, dates, costs, or details | Maintenance |
| `DELETE /accounts/{accountId}/maintenance/{maintenanceId}` | Soft-delete a maintenance record | Maintenance |

Expenses may reference a document. Maintenance records may reference related documents. Validate every referenced record against the same account. Expense categories, maintenance states, and allowed state transitions must be defined in feature-level schemas.

### Documents

| Method and path | Purpose | Access |
|---|---|---|
| `GET /accounts/{accountId}/documents` | List document metadata; support related-record filters | Documents |
| `POST /accounts/{accountId}/documents` | Upload a private document and associate it with an allowed business record | Documents and access to the associated record |
| `GET /accounts/{accountId}/documents/{documentId}` | Get document metadata | Documents and access to the associated record |
| `GET /accounts/{accountId}/documents/{documentId}/content` | Download or stream document content through the authenticated API | Documents and access to the associated record |
| `PATCH /accounts/{accountId}/documents/{documentId}` | Update editable metadata or association | Documents and access to both associations |
| `DELETE /accounts/{accountId}/documents/{documentId}` | Soft-delete document metadata and schedule private object cleanup | Documents |

Keep file bytes in private object storage and metadata/storage keys in the database. Do not return storage keys or unrestricted public URLs. Upload limits, accepted media types, malware scanning, content disposition, and the deletion/restore lifecycle for the stored object must be specified before implementation. An association must point to a supported record in the same account.

### Notifications and calendar

| Method and path | Purpose | Access |
|---|---|---|
| `GET /accounts/{accountId}/notifications` | List notifications for the current member | Notifications |
| `PATCH /accounts/{accountId}/notifications/{notificationId}` | Update the current member's notification state, such as read/unread | Notifications |
| `GET /accounts/{accountId}/calendar?from={date}&to={date}` | List permitted upcoming events and important dates in a date range | Relevant source areas |

Notifications are scoped to the current user even when their source record is account-scoped. Calendar results must include only event types and records the user is authorized to view. Delivery remains provider-independent; delivery channels and event generation rules require feature-level definitions.

### Reports

| Method and path | Purpose | Access |
|---|---|---|
| `GET /accounts/{accountId}/reports/portfolio` | Property and rental summary for a requested period | Properties and Contracts |
| `GET /accounts/{accountId}/reports/payments` | Payment history and overdue payment summary | Payments |
| `GET /accounts/{accountId}/reports/expenses` | Expense summary for a requested period, optionally filtered by property or category | Expenses |

Report filters must validate date ranges, account-scoped identifiers, and supported groupings. Results must respect the same per-area authorization as source records. Export formats and additional report types are not specified in this release contract.

### Settings and activity

| Method and path | Purpose | Access |
|---|---|---|
| `GET /accounts/{accountId}/settings` | Read account-level settings | Owner |
| `PATCH /accounts/{accountId}/settings` | Update account-level settings | Owner |
| `GET /me/preferences` | Read the current user's locale, formatting, and notification preferences | Authenticated |
| `PATCH /me/preferences` | Update the current user's preferences | Authenticated |
| `GET /accounts/{accountId}/activity` | List relevant account activity with filters and pagination | Activity |

Activity entries are read-only through this API. Record enough context to explain relevant actions without retaining unnecessary personal data, secrets, or full document contents. Define which actions are recorded and the retention policy before implementation.

## Cross-cutting behavior

- Validate all path parameters, query parameters, headers, and request bodies at the HTTP boundary before invoking application use cases.
- Enforce account ownership and relationships in application/domain logic as well as persistence constraints; never rely only on client-side validation.
- Use explicit response DTOs and omit fields the caller is not allowed to see.
- Use database transactions for multi-record operations such as creating a contract with tenant associations.
- Return `409` for conflicts with the current resource state; include a stable error code that allows the client to present a useful message.
- Add rate limits and abuse protections to registration, login, verification, invitation, and password recovery endpoints.
- Avoid logging passwords, tokens, invitation/reset challenges, document contents, or unnecessary personal data.
- Provider failures must map to safe, stable API errors; do not leak runtime, database, storage, or email-provider details.
- Add API tests for validation, account isolation, per-area authorization, owner-only operations, business invariants, response shapes, and deletion/restoration.

## Open decisions before implementation

1. Authentication credential design: cookie or authorization header, token/session format, claims, expiry, refresh rotation, revocation, and CSRF protections.
2. Exact schemas and validation rules for every request and response, including identifiers, addresses, contact fields, and account settings.
3. Contract, payment, expense, and maintenance status models, transition rules, and date-boundary behavior.
4. Payment modeling for partial receipts and multiple receipts, and which payment status values are derived.
5. Upload size/type limits, malware scanning, content delivery safeguards, and object cleanup behavior across delete and restore.
6. Invitation expiry, duplicate handling, ownership transfer, account closure, and last-owner protection.
7. Dashboard/report aggregation windows, behavior with partial area access, and any future export requirements.
8. Default and maximum list page sizes, rate-limit policy, and whether write operations need idempotency keys or optimistic concurrency controls.
