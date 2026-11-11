# Testing Strategy

Testing is part of the architecture and must accompany each feature. The workspace runs `npm test` for API handler, SQLite migration, Node/Workerd runtime, and local D1 schema tests, `npm run test:graph` for Nx affected-project and target selection, and `npm run test:e2e` for a Chromium smoke test. PR validation runs full targets for affected apps and shared projects, with changed-file formatting checks and independent repository safeguards. Migration tests use in-memory SQLite and an isolated Miniflare D1 instance, not PROD. See the [development workflow](DEVELOPMENT.md) for setup, caching, and commands. These checks do not yet provide the complete coverage described below or deployed Worker verification.

## Test levels

### Unit

Cover domain rules, entities/value objects, application use cases, validation, calculations/formatting, and important frontend behavior. Tests should be deterministic and independent of external services.

Include inclusive contract-date boundaries, whole-property versus room conflicts, early endings and unresolved renewals; test partial receipts, cross-month allocation, unallocated credit, reductions, and late-rent warnings. Cover optional schedule generation, month-end due dates, confirmed renewals, rent-change previews and deposit accounting. Cover renewal reminder timing, immediate warnings for missed reminder dates, and user preferences.

Test first and final partial monthly periods: suggest the full monthly amount, accept a separately agreed amount without changing ongoing rent, and avoid duplicate entries when the first and final partial periods are the same month.

Test weekly coverage from Monday through Sunday and selected due weekdays within the covered week, including a due date before a partial first week starts. For partial first or last weeks, suggest the full weekly amount, allow the separately agreed amount without changing ongoing rent, and avoid duplicate entries when both are the same week.

Test calendar-quarter, calendar-half-year, and calendar-year coverage, including the landlord-selected due month, its first-month default, month-end fallback, partial first and last periods, year boundaries, and leap years. Keep selected due dates outside a partial contract period, suggest the full period amount while allowing an agreed amount, and avoid duplicate entries when the first and last partial periods coincide.

Test generation with pre-existing manual and generated entries, retries, concurrent requests, and ambiguous or conflicting entries. Existing entries must remain unchanged, skipped periods must appear in the summary, and no duplicates may be created.

Test generation while an expected entry for the same period remains recoverably deleted: skip and report it rather than creating a replacement, respecting current permissions. Block manual creation until the deleted entry is restored or the suppressed period is re-enabled. After purge, test suppression without retaining the deleted amount or unnecessary personal data. Require an authorized editor's confirmation after showing the effects of re-enabling; do not restore the purged entry. Test associated-data erasure and conflicts with replacement entries once defined.

Test deposit receipts, returns, and deductions independently of rent. Warn and require landlord confirmation before allowing a negative tracked balance; display the negative amount and recheck confirmation if concurrent changes invalidate the shown balance.

Test allocated receipt corrections above, equal to, and below the allocated total. Require reviewed allocation adjustments before saving when necessary, preserve visible history, prevent inconsistent partial writes or silent redistribution, and recalculate credit, balances, and overdue status.

Test that deleting an allocated receipt is blocked until every allocation is removed separately; show the resulting effects on credit and rent balances. Restore eligible receipts as unallocated credit without reinstating allocations, preserve allocation history, and enforce current authorization and associated-record and archive rules.

Test that deleting an expected-rent entry is blocked until allocations and reductions are removed separately; show the effects on credit, balances, alerts, and reports, and preserve change history. Restore eligible entries without automatically reinstating allocations or reductions, enforce current permissions and associated-record and archive rules, and test recovery conflicts with replacement entries once defined.

Test overdue status on and after the due date at the `Europe/Lisbon` calendar boundary, including daylight-saving changes, partial allocations, reductions, fully settled balances, and unallocated versus applied contract credit.

Test property and room archive/delete restrictions for active and future room or whole-property contracts, unresolved renewals, and retained history. Verify archived properties and rooms remain read-only until restored and their outstanding balances and overdue warnings remain visible; test 30-day recovery for permitted deletions.

Test Portuguese address and postal-code validation, same-account tenant reuse and selection, and denial of cross-account association or access without the relevant area permissions.

Test notification recipients, individual preferences, and access revocation/restoration without exposing inaccessible record details.

Test Viewer defaults for invited members, owner adjustments before invitation, owner-only membership administration, and associated-record restrictions for documents.

Test document size/type boundaries and content validation, required malware scanning and unavailable/failure paths, account-scoped storage usage, warning thresholds, and streaming behavior in the actual deployed Worker runtime. Recheck provider limits and free-tier terms before provisioning.

Test that attached active documents block record deletion until moved or deleted separately, including permission checks and non-leaking error responses. Test record-before-document restoration, no automatic document restoration, independent recovery deadlines, expiry boundaries, authorization changes, and purge/restore concurrency.

Test maintenance estimates and linked expenses without double-counting, built-in expense categories, and reopening completed or cancelled maintenance items.

Test the 90-day dashboard prediction with signed and unsigned contracts, pending and confirmed renewals, missing schedule data, filtering, and already-recorded entries. Exclude recoverably deleted and suppressed periods and warn that the forecast may be incomplete; predictions and warnings must not create duplicate payments or leak inaccessible account data.

Test the current-calendar-year report default, custom date ranges, original rent due, reductions and net rent due by payment due date versus actual rent receipts by receipt date, unallocated rent credit, receipts allocated across payments or periods without double-counting, exclusion of deposits, and the separately labeled current overdue balance across period boundaries.

Test reports with missing expected entries: figures use only recorded entries, identifiable gaps prompt warnings, and reporting does not estimate or create missing entries. Gap warnings must not reveal information from inaccessible records.

Test a later receipt correction against the receipt's reporting period, including a corrected receipt date that moves it to a different period; retain the previous value and correction in history.

Test expense reports against the landlord-entered expense date, including an expense entered or paid in a different period. Do not treat maintenance estimates as actual expenses or count linked expenses twice.

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

The planned local setup must run the web app, API, database, migrations, mock data, test users, authentication, and test file uploads without using PROD resources. Developers must be able to inspect and query the local database and manually exercise the app and API. Never use PROD data for local development or testing.

## CI selection and caching

Nx should run tasks for changed projects and their dependents, while caching deterministic task outputs. Declare task inputs and outputs correctly. A change to a shared package must trigger all dependent app checks/builds; unrelated app changes should not.

PR validation currently includes type checking, linting, formatting validation, available unit, Node/Workerd integration and browser tests, and build validation. Add integration and Worker runtime tests as new capabilities are implemented. Do not bypass a failing quality gate to make a workflow pass. See the [PR validation guide](workflows/execute-pr-validation/README.md) for its exact flow.
