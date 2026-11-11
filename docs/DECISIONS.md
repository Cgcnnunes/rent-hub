# Decision Log

This log records choices gathered for the initial project baseline. Revisit decisions when implementation evidence or product needs change.

## Decided

| Topic | Decision | Rationale |
|---|---|---|
| Product | Rent Hub, initially for landlords in Portugal | Centralize property-management workflows |
| Client | Responsive website for desktop, tablet, and mobile | One web client for the first release |
| Initial locale | `pt-PT`, EUR, `DD/MM/YYYY`, `Europe/Lisbon` | Match the initial market |
| Documentation | English | Explicit user choice |
| Account ownership | Rental data belongs to an account; self-service registration creates an owner account | Supports shared access without changing the owner model later |
| Membership | A user may belong to multiple accounts | Supports invitations to other landlord accounts |
| Access | Built-in No access, Viewer, and Editor levels, assigned separately by application area | Enables limited access without a custom role builder |
| Member administration | Account owner only | Keeps invitations and access changes controlled |
| Invitation defaults | Viewer in each business area unless the owner changes it | Default invited members to read-only access while retaining owner-only member administration |
| Editor deletion | Editors may delete records; deleted records are recoverable for 30 days, then permanently deleted | Allows routine cleanup with a recovery window |
| First-release scope | All listed business modules | User requested all listed modules in the first usable release |
| Payments | Manual recording first; integrations later | Defer financial-provider integration complexity |
| Rental spaces | Rent a whole property or user-named rooms under that property | Support independent room contracts while retaining the shared address |
| Contract conflicts | Inclusive dates; signed whole-property and same-room contracts cannot overlap; unresolved potential renewals block conflicting signatures | Prevent double-booking while allowing simultaneous contracts for different rooms |
| Contract endings | Manually record early end dates and retain original signed dates; show normal endings automatically | Preserve history and calculate availability from the effective end |
| Renewal | Landlord enters renewal terms and notice deadline; suggested renewals require confirmation | Avoid claiming automated legal determinations |
| Rent receipts | Support multiple receipts and allocations across expected payments; suggest oldest outstanding first and retain unallocated contract credit | Track arrears and excess payments without processing money |
| Overdue rent | A positive remaining balance becomes overdue the calendar day after its due date in `Europe/Lisbon`; unallocated credit does not reduce it until applied | Give consistent partial-payment balances and reminders |
| Rent reductions | Record confirmed per-payment non-cash reductions separately from receipts, with explanation and history | Preserve original rent and actual cash received |
| Rent schedules | Manual by default; optional generation for confirmed periods with weekly, monthly, quarterly, six-monthly, or yearly frequency | Automate records without processing payments |
| Deposits | Record receipts, returns, and deductions separately from rent; allow a negative tracked balance only with warning and landlord confirmation | Preserve the distinction between rent and deposits while allowing confirmed discrepancies |
| Reminder channels | In-app notifications and calendar first; email reminders later | Keep initial reminders simple while preserving authentication emails |
| Document uploads | PDF, JPEG, and PNG up to 20 MB per file initially; require a suitable successful malware scan before availability and block uploads if scanning is unavailable; monitor usage without a per-account quota | Support common documents without exposing unscanned files while checking provider limits and costs |
| Document associations | Block record deletion while active documents are attached; restore deleted records before their documents, with independent 30-day deadlines | Avoid silently deleting or orphaning documents while preserving separate recovery periods |
| Dashboard forecast | Predict the next 90 days from signed contracts and confirmed renewals; label estimates and avoid duplicate payment entries | Give landlords a forward view without treating unsigned agreements as commitments |
| Rental reports | Show recorded original rent, reductions, and net rent due by due date, actual rent received by receipt date, and current overdue balance separately; warn of identifiable gaps without filling them | Distinguish obligations from cash and forecasts without double-counting allocations |
| Expense reporting | Group expenses by a required landlord-entered expense date, not an assumed payment or entry date | Keep period totals explicit without implying payment tracking |
| Archiving | Preserve property, room, and signer history; block property or room archive/delete for relevant active or future signed contracts or unresolved renewals | Keep active commitments visible while retaining inactive history |
| Backend | Native Web APIs with no framework; Hono excluded | Keep HTTP delivery portable and business logic independent |
| Monorepo | npm workspaces and Nx | npm is the selected package manager; Nx supports affected checks/deployments and caching for independently deployable apps |
| Hosting | Cloudflare Free initially; prefer EU storage where available | Keep initial operating costs within the free tier |
| Data processing location | No EU-only processing promise | Cloudflare Free is preferred; strict regional processing is not a launch guarantee |
| Repository | Public, no license, default branch `main` | Public viewing without granting an open-source reuse license |
| Main protection | Active ruleset requires pull requests, one approval, and the `PR validation` status check; blocks direct pushes, deletions, and force pushes; repository admins may bypass | Protect the default branch while retaining the requested admin bypass |
| UI proposals | Show four variants for selection | Explicit user preference |
| Selected UI | Atlantic shared structure with Ledger, Atlantic, Bento, Casa, and Dark themes; Ledger is the default | Keep layouts, functionality, and permissions consistent across themes |
| Theme preference | Store per user in the database; an optional logged-in browser cache is cleared on logout | Sync choices across sessions and devices while keeping the database authoritative |
| Deleted items | Account-scoped; Viewers can list records in their permitted areas, Editors can restore | Preserve area permissions during the recovery period |
| Deleted rent periods | Keep a separate minimal suppression marker after purge until an authorized editor confirms re-enabling the period or associated data is permanently erased | Respect deliberate deletion without retaining the deleted entry itself; privacy/erasure handling requires design |
| Rollback | Explicitly redeploy an older, previously successful PROD release after checking database compatibility | Allow known-release recovery without treating it as a new release |
| Release version | Apply the highest PR release type once to the latest created release or TEST pre-release | Produce a single next version for a release containing multiple PRs |
| Merge method | Squash merges only, using the PR title as the default commit subject | Avoid automatically generated merge commits and keep one commit per PR |

## Pending validation or implementation choice

| Topic | Current direction | Next step |
|---|---|---|
| Next.js on Workers | Adapter not selected; Cloudflare's [currently recommended path](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) is beta | Prototype required Next.js features and compare supported deployment paths |
| Cloudflare data location | EU storage options where supported on Free; no EU-only processing guarantee | Verify per-service plan availability and guarantees before creating production resources; see [R2 data location](https://developers.cloudflare.com/r2/reference/data-location/) |
| Nx cache | Use affected tasks and local task caching | Decide whether/when to enable remote caching |
| Token details | Custom auth with JWT or equivalent signed tokens | Specify claims, expiry, refresh, revocation, cookie/transport behavior, and CSRF protections during auth design |
| Email provider | Provider-independent delivery | Select a provider and confirm free-tier limits before implementation |
| Malware scanning | Successful scanning gates document availability | Select and validate a suitable scanner; define quarantine, failures, retries, and Cloudflare Free compatibility |
| GitHub repo | Public `Cgcnnunes/rent-hub` created; `main` pushed; `Protect main` ruleset and required PR check active | Expand PR validation to Nx quality tasks when app packages exist |
| Commit sequence | Format is `type(rent-xxxxx): description`; commit sequence is distinct from feature branch sequence | Define collision-safe allocation before enforcing in hooks/CI |
| Deployment queue | TEST deployments must queue; GitHub concurrency alone is not FIFO | Implement and test a durable serialization mechanism |
| Production history | Successful deployments must be tracked durably | Select GitHub deployment records or equivalent metadata |
