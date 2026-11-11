# Product Requirements

## Overview

Rent Hub is a property-management web application initially aimed at individual landlords in Portugal. It provides one place to manage properties, tenants, rental contracts, payments, expenses, maintenance, documents, notifications, reporting, and related work.

The first usable release is intended to include all modules listed below. The product is experimental and may evolve; avoid coupling business rules to a particular hosting provider or third-party service.

Future capabilities may be shown before they are available as disabled controls with a clear explanation such as "coming soon". Do not present an unavailable action as functional.

## Audience and client

- Initial market: Portugal.
- Initial product users: landlords who create an account and manage rental portfolios.
- Client: one responsive website for desktop, tablet, and mobile; native mobile apps are not part of the first release.
- Initial interface locale: Portuguese (Portugal), `pt-PT`.
- Initial currency: EUR.
- Initial date display: `DD/MM/YYYY`.
- Initial timezone: `Europe/Lisbon`.
- Documentation language: English.

## Accounts and access

- Self-service registration creates an account and makes the registering user its owner.
- A user may accept invitations to other accounts and may belong to multiple accounts.
- Account owners can invite and remove members and change their access.
- New invitations default to Viewer in every business area; the owner can change each area before inviting. This grants access to the corresponding account records, subject to associated-record checks. Member administration remains owner-only.
- Access is selected separately for each application area, using built-in levels:
  - **No access:** the area and its records are not available to the member.
  - **Viewer:** can view records in the area.
  - **Editor:** can view, add, change, and delete records in the area.
- The account owner has account-management authority. Editors cannot manage members or their access.
- Deleted records remain in a deleted-items area for 30 days and can be restored during that period. Viewers can see deleted records in areas they may view; only Editors can restore records in their permitted areas. They are permanently deleted after the retention period.
- Authorization must be enforced by the backend, not only by hiding interface elements.

The initial business model remains account-based even when an account has only one person. The database design must support memberships and per-area access from the start without introducing an unnecessarily complex custom role builder.

## First-release modules

| Module                     | Initial scope                                                                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard                  | Property and active-contract summaries, upcoming and overdue payments, recent activity, maintenance, and important dates.                                      |
| Properties                 | Create and edit properties and optional named rooms; view address, associated tenants and contracts, and related records.                                      |
| Tenants                    | Manage contract signers through the associated property; provide an Add Tenant action on the property page to users who may view the property and add tenants. |
| Contracts                  | Manage whole-property or room contracts, signers, lifecycle, renewals, dates, and history; enforce the rental-space overlap rules below.                       |
| Payments                   | Track expected rent, receipts, allocations, outstanding balances, overdue amounts, and agreed reductions manually; payment-provider integrations are deferred. |
| Expenses                   | Record and categorize property expenses, with optional related documents.                                                                                      |
| Maintenance                | Record requests and activities, status, dates, costs, and related documents.                                                                                   |
| Documents                  | Upload and manage private files associated with business records.                                                                                              |
| Notifications and calendar | Track relevant events and upcoming contract/payment dates. Keep delivery provider-independent.                                                                 |
| Reports                    | Property and rental summaries, payment history, overdue payments, expenses, and future landlord reports.                                                       |
| Settings                   | Account and user preferences, locale/formatting, and notification preferences.                                                                                 |
| Activity log               | Record relevant actions with enough context to explain changes without retaining unnecessary sensitive data.                                                   |

## Core data concepts

The initial business model includes users, accounts, memberships, properties, rentable rooms, contract signers, contracts, expected rent, receipts and allocations, rent reductions, expenses, documents, maintenance, notifications, user preferences, activity logs, invitations, and per-area access settings. Authentication may also require sessions, refresh tokens, email verifications, and password resets.

The exact table names, relationships, and constraints are implementation decisions. Use relational data, foreign keys, indexes, migrations, and integrity constraints. Keep file bytes in private object storage and file metadata/storage keys in the database.

## Rental spaces and contracts

- A property can be rented as a whole, or contain separately rentable rooms. Each room belongs to one property, uses its address, and has a landlord-defined name. A whole-property rental does not require room records.
- Require a property name, address, Portuguese postal code in `1234-567` format, and locality. Building number and floor/door are optional. Property type, bedrooms, area, and notes are optional.
- Require a signer's name; email, telephone, and Portuguese tax number (NIF) are optional. Do not collect identity-document numbers or dates of birth by default. Allow an existing tenant record to be reused across properties and contracts in the same account. The property Add Tenant flow can select an existing tenant or create one, subject to the relevant permissions.
- A contract may have one or more signers. Other occupants are not contract signers; optionally record the number of other adults, number of children, and whether pets are present (yes/no/unknown). A blank count means unknown. Do not collect occupants' names, ages, health details, or a household free-text note by default.
- Contract start and end dates are inclusive. Signed contracts for the same room must not overlap. A signed whole-property contract must not overlap a signed contract for any of its rooms. Contracts for different rooms may overlap.
- Drafts and newly created contracts do not reserve dates. The landlord manually marks an already signed contract as signed; electronic signing is not part of the initial release. Refuse signing when it conflicts and explain the conflict in the UI.
- A signed contract can have a future start date. Show it as ended automatically after its scheduled end date. For an early ending, the landlord records the actual end date; retain the originally signed dates and use the actual end for availability. A space becomes available after its inclusive effective end date, subject to other contracts and unresolved renewals.
- Distinguish draft, signed, ended, ended early, and cancelled lifecycle states. Detailed transitions and treatment of corrections remain to be defined before implementation.

## Contract renewal and notice

- Support renewal periods and notice deadlines entered by the landlord. Suggest the next period for landlord confirmation; do not silently record a renewal. Until a pending renewal is resolved, block signing a new contract that overlaps the potential renewal for the same space.
- Track each renewal as upcoming, confirmed, or non-renewal recorded. Keep confirmed periods in the same contract's history; check for conflicting signed contracts before confirmation.
- The landlord can record non-renewal, including the date notice was sent, intended end date, and an optional supporting document. Recording the information does not send notice or verify its delivery or legal validity.
- Show Portuguese-law guidance only after it has been checked against current official legislation and professionally reviewed. The landlord enters the applicable deadline; the first release must not automatically calculate it or claim legal compliance. Keep future automated legal-rule capabilities extensible.
- Show the entered deadline in the calendar and default to reminders 60, 30, and 7 days beforehand. Landlords may change or disable reminders. If reminder dates have passed when the deadline is entered, show an immediate warning and schedule remaining future reminders.
- Renewal and overdue-rent alerts use in-app notifications and the calendar initially; email reminders are deferred. Authentication verification and password-recovery emails remain separate requirements. Notify account members who can view the relevant records, subject to their own notification preferences. Recheck access whenever notifications are read and immediately hide alerts for records no longer accessible; previously hidden alerts may reappear only if access is restored and they remain relevant.

## Manual rent tracking

- Allow several receipts against one expected payment and one receipt allocated across multiple expected payments on the same contract. Suggest allocating to the oldest outstanding rent first; the landlord confirms or changes the allocation.
- Keep any unallocated receipt amount as credit on that contract for later application. Show overdue rent and warn when rent is late. Do not claim to process payments.
- Allow correction of an allocated receipt while preserving visible correction history. If the corrected amount is less than its current allocations, require the landlord to review and adjust the affected allocations before saving; do not silently redistribute them. Save the correction and allocation changes consistently, and recalculate affected credit, balances, and overdue status.
- Block deletion of a receipt while any allocations remain. The landlord must remove those allocations separately before deleting it; show the effect on credit, outstanding balances, and overdue status. Permitted receipt deletions follow the 30-day recovery policy. Restore an eligible receipt as unallocated contract credit, preserving allocation history but not automatically restoring allocations; the landlord may allocate it again. Apply current permissions and associated-record and archive rules to restoration.
- Block deletion of an expected-rent entry while it has allocations or agreed reductions. The landlord must remove them separately before deleting the entry; show the effect on credit, outstanding balances, overdue alerts, and reports. Preserve the history of those changes. Permitted deletions follow the 30-day recovery policy. Restore an eligible entry without automatically reinstating allocations or reductions; preserve history and let the landlord add them again. Apply current permissions and associated-record and archive rules, and define recovery conflicts with replacement entries before implementation.
- An expected payment is overdue from the calendar day after its due date in `Europe/Lisbon` while its remaining balance is positive. Calculate that balance from the expected amount less confirmed receipt allocations and agreed reductions; unallocated contract credit does not reduce it until applied. On the due date itself it is not yet overdue. Show the remaining balance, including for partially paid rent.
- Allow the landlord to confirm an agreed non-cash reduction on a specific expected payment, recording its amount and an explanation. Preserve the original rent, keep the reduction separate from cash receipts, and reject a reduction greater than the remaining amount due. Corrections must remain visible in activity history.
- Manual creation of expected rent entries is the default. Optionally generate entries for the full confirmed contract period using a landlord-selected schedule: weekly, monthly, quarterly, every six months, or yearly. Generate a renewal's entries only after confirmation, and only when automatic generation is enabled.
- When generation finds an existing expected-rent entry for a period, leave it unchanged, skip that period, and include it in a generation summary. Flag ambiguous or conflicting entries for review rather than silently replacing them or generating duplicates. Retrying or concurrent generation must not create duplicates; define matching and conflict handling before implementation.
- When a deleted expected-rent entry for the same period is still recoverable, skip that period and report the recoverable entry so an authorized landlord can decide whether to restore it. After permanent purge, retain a separate minimal suppression marker for the contract and period so generation does not automatically recreate it. The deleted entry itself is still purged; the marker must not retain its amount or unnecessary personal data.
- Block manual creation for a recoverably deleted period until the original entry is restored, and for a suppressed period until it is explicitly re-enabled. Keep the suppression marker until an authorized editor explicitly re-enables the period or the associated data is permanently erased. Show the effect and require confirmation before re-enabling; this permits a new entry or future generation, but does not restore the purged entry. Define privacy/erasure handling and conflicts with existing replacement entries before implementation.
- The landlord chooses the due day. A due date is not the end of the rental period: monthly rent can cover the full calendar month even when due on another day. If a month-based schedule's chosen day does not exist in a month, use its last day and return to the chosen day when available. For a first or final partial month, suggest the full monthly amount but allow the landlord to enter the separately agreed amount without changing ongoing rent.
- Weekly rental periods follow calendar weeks, Monday through Sunday; the first and last may be partial. The landlord selects the payment due weekday separately, within the covered calendar week; that date may be before the contract starts in a partial first week. For a first or final partial week, suggest the full weekly amount but allow the landlord to enter the separately agreed amount without changing ongoing rent.
- Quarterly periods follow calendar quarters; six-month periods are January–June and July–December; yearly periods are January–December. The first and last periods may be partial. The landlord selects the due month within each covered calendar period, defaulting to its first month, as well as the due day; the existing month-end fallback applies. Keep that due date even if it falls before the contract starts or after it ends within a partial period. For a first or final partial period, suggest the full period's amount but allow the landlord to enter the separately agreed amount without changing ongoing rent.
- Record a proposed later rent change, intended effective date, manually entered notice-sent date, and optional notice document. Preserve the previous amount and apply the change only after landlord confirmation. Preview changes to future unpaid entries and require confirmation; never silently rewrite entries with receipts, reductions, or other activity.
- Track deposit money received, returned, and deducted separately from rent. Record explanations for deductions; do not claim that a deduction or notice is legally valid without appropriate verification.
- Calculate the tracked deposit balance as recorded deposit receipts minus returns and deductions. A return or deduction may make that balance negative only after an explicit warning and landlord confirmation; display the negative balance rather than hiding it. This is a tracking balance, not a claim that the app holds funds or that a deduction is legally valid.

## Archiving and retained history

- Block both archiving and deleting a property when it has an active or future signed contract, including contracts for its rooms, or an unresolved renewal. A future signed contract remains a commitment even before occupancy starts.
- Once those commitments have ended or been resolved, allow the landlord to archive the property to preserve its history. Archived properties leave the normal active list, remain available in an archived list, and are read-only until restored. Keep outstanding balances and overdue warnings visible; restore the property before recording changes.
- Block deletion of properties with retained contract or financial history; allow archiving instead where the above safeguards permit it. The existing 30-day recovery policy applies to permitted deletions.
- Apply the same rules to rooms: block archiving or deletion while the room has an active or future signed commitment or unresolved renewal, including a commitment for the whole property. Once resolved, allow archiving with history preserved; block deletion while retained contract or financial history exists. Archived rooms are read-only until restored; keep their outstanding balances and overdue warnings visible. Permitted deletions use the 30-day recovery policy.
- Block deletion of a signer while a retained contract references them; allow archiving the tenant record instead. Privacy and personal-data erasure requests require a separately reviewed process.
- Block deletion of an otherwise deletable record while it has active attached documents. A user with the necessary permissions must first move or delete those documents separately. This does not require deleting documents when archiving a record.
- A record may be deleted after its attached documents have been deleted, even while those documents remain recoverable. Restore the associated record before restoring a document; restoring the record does not automatically restore its documents. The record and each document retain their own 30-day recovery deadlines, after which each is permanently purged. Apply current account and area permissions to each restoration.

## Document uploads and storage

- Initially accept PDF, JPEG, and PNG files up to 20 MB per file. Validate file contents and safe handling separately from extension and declared media type.
- Require a suitable malware scan before an uploaded file becomes available. If scanning is not available, block uploads and show a clear unavailable or coming-soon message; do not treat unscanned files as available. Decide quarantine, failure and retry behavior before implementation.
- Do not enforce an account storage quota initially. Show each account its own storage usage without exposing other accounts' data. Monitor total provider usage and warn the application operator in-app as the environment approaches its free allowance; decide thresholds after validating actual provider usage and billing.
- A file limit is not a storage cost guarantee. Validate current Cloudflare plan limits before provisioning, stream uploads where feasible, and test actual Worker runtime memory and upload behavior.

## Dashboard prediction

- Show upcoming rent for the next 90 days as a prediction, with a clear label even when filters are applied. Base the forecast on signed contracts and confirmed renewal periods only; exclude drafts, unsigned contracts, and unconfirmed renewals.
- Include recorded expected rent entries and estimate missing future entries from signed schedules without creating duplicate payment records. Warn when missing information prevents a complete forecast.
- Exclude periods with recoverably deleted expected-rent entries or post-purge suppression markers from the forecast rather than estimating them from the schedule. Warn that the forecast may be incomplete without revealing records the user cannot access.
- A future payment-history-based forecast is exploratory and deferred beyond the first release; it must not make automated decisions about tenants.

## Reports

- Default the report period to the current calendar year and allow the landlord to select another period.
- Show rent due within the selected period and actual rent receipts received within the period as separately labeled figures. Group expected rent by due date and receipts by receipt date; count each receipt once even when allocated across multiple payments or periods. Include unallocated rent receipts in received amounts and keep deposit movements separate.
- For rent due in the period, show the original expected rent, agreed non-cash reductions, and net rent due separately. Calculate net rent due as original expected rent less its confirmed reductions, grouped by the payment's due date; this is not the same as the remaining unpaid or overdue balance.
- Base rent-due figures on recorded expected entries only; do not silently estimate or create entries to fill gaps. Warn when missing entries can be identified, without implying that every gap can always be detected. The dashboard's separately labeled forecast remains distinct from these reports.
- Report the current corrected value of a receipt in the period containing its receipt date, even if the correction was made later; retain the earlier value and correction in history. If the receipt date itself is corrected, use the corrected date for period reporting.
- Group expenses by their landlord-entered expense date. Do not assume that date is the payment date or the date the expense was entered into the app.
- Show overdue rent as a separately labeled current outstanding balance, rather than silently restricting it to the selected report period.
- Define gap detection and treatment of other corrections and expense adjustments before implementing report calculations.

## Expenses and maintenance

- Initial built-in expense categories are Maintenance and repairs, Utilities, Insurance, Condominium, Taxes and fees, and Other. Custom categories are deferred.
- Require the landlord to enter an expense date for each expense. It is not automatically treated as a payment date.
- An actual maintenance cost is recorded as an expense and may be linked to the maintenance activity. Show the linked expense on the maintenance page, but count it only once in financial reports. A maintenance activity may also have an estimate before an actual expense exists.
- Maintenance states are Open, In progress, Completed, and Cancelled. Landlords can reopen a completed or cancelled item. Define the complete transition rules before implementation.

## Authentication

- Use custom authentication, not an external identity provider as a required architectural dependency.
- Support self-service registration and login with secure password storage.
- Require email verification before a new user can use the application.
- Support password recovery, session/token lifecycle, refresh and revocation as appropriate.
- Use JWT or an equivalent signed token mechanism with a documented claims and expiry contract.
- Keep authentication secrets separate between TEST and PROD.
- Account invitations must use the normal authentication flow; they must not create an authentication bypass.

## UI proposal preference

Whenever a UI is proposed for selection, present exactly four variants for the user to choose from.

## Selected UI direction and themes

- See the [UI design direction and illustrative concept](UI-DESIGN.md) for the shared layout, theme treatments, and reference status.
- Use the Atlantic structure and shared components across desktop, tablet, and mobile.
- Offer Ledger, Atlantic, Bento, Casa, and Dark as visual themes. All themes retain the same structure, functionality, and permissions.
- Ledger is the default for anonymous visitors and newly created accounts. Save a user's selection in database-backed user preferences, shared across sessions, devices, and account switches.
- A browser may cache the selected theme for faster navigation while the user is logged in. The database preference is authoritative: refresh it at sign-in, prefer it over a conflicting cache, and clear the cache on logout.
- Report preference-saving failures rather than silently presenting a change as saved.

## Localization

Do not hardcode user-facing text throughout application logic. Keep translation dictionaries and locale-specific formatting separate from business calculations. Design for additional languages and timezones.

## Product constraints

- Features may be added, removed, replaced, or refactored as the product evolves.
- Payment tracking starts as manual entry; integrations may be evaluated later.
- The application must keep activity history useful without storing unnecessary personal data.
- Data deletion uses a 30-day recovery period before permanent deletion.
