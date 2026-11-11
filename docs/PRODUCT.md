# Product Requirements

## Overview

Rent Hub is a property-management web application initially aimed at individual landlords in Portugal. It provides one place to manage properties, tenants, rental contracts, payments, expenses, maintenance, documents, notifications, reporting, and related work.

The first usable release is intended to include all modules listed below. The product is experimental and may evolve; avoid coupling business rules to a particular hosting provider or third-party service.

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
- Access is selected separately for each application area, using built-in levels:
  - **No access:** the area and its records are not available to the member.
  - **Viewer:** can view records in the area.
  - **Editor:** can view, add, change, and delete records in the area.
- The account owner has account-management authority. Editors cannot manage members or their access.
- Deleted records remain in a deleted-items area for 30 days and can be restored during that period. Viewers can see deleted records in areas they may view; only Editors can restore records in their permitted areas. They are permanently deleted after the retention period.
- Authorization must be enforced by the backend, not only by hiding interface elements.

The initial business model remains account-based even when an account has only one person. The database design must support memberships and per-area access from the start without introducing an unnecessarily complex custom role builder.

## First-release modules

| Module | Initial scope |
|---|---|
| Dashboard | Property and active-contract summaries, upcoming and overdue payments, recent activity, maintenance, and important dates. |
| Properties | Create and edit properties; view details, address, associated tenants and contracts, and related records. |
| Tenants | Manage tenant information through the associated property; provide an Add Tenant action on the property page to users who may view the property and add tenants; support multiple tenants on a contract. |
| Contracts | Manage dates and status, retain historical contracts, and prevent overlapping active contracts unless an explicitly supported arrangement permits them. |
| Payments | Record expected and received rent, due dates, payment dates, amounts, status, and overdue payments, associated with contracts. Manual tracking is the first-release scope; payment-provider integrations are deferred. |
| Expenses | Record and categorize property expenses, with optional related documents. |
| Maintenance | Record requests and activities, status, dates, costs, and related documents. |
| Documents | Upload and manage private files associated with business records. |
| Notifications and calendar | Track relevant events and upcoming contract/payment dates. Keep delivery provider-independent. |
| Reports | Property and rental summaries, payment history, overdue payments, expenses, and future landlord reports. |
| Settings | Account and user preferences, locale/formatting, and notification preferences. |
| Activity log | Record relevant actions with enough context to explain changes without retaining unnecessary sensitive data. |

## Core data concepts

The initial business model includes users, accounts, memberships, properties, tenants, contracts, contract tenants, payments, expenses, documents, maintenance, notifications, user preferences, activity logs, invitations, and per-area access settings. Authentication may also require sessions, refresh tokens, email verifications, and password resets.

The exact table names, relationships, and constraints are implementation decisions. Use relational data, foreign keys, indexes, migrations, and integrity constraints. Keep file bytes in private object storage and file metadata/storage keys in the database.

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
