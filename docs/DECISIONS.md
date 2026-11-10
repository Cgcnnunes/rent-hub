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
| Editor deletion | Editors may delete records; deleted records are recoverable for 30 days, then permanently deleted | Allows routine cleanup with a recovery window |
| First-release scope | All listed business modules | User requested all listed modules in the first usable release |
| Payments | Manual recording first; integrations later | Defer financial-provider integration complexity |
| Backend | Native Web APIs with no framework; Hono excluded | Keep HTTP delivery portable and business logic independent |
| Monorepo | npm workspaces and Nx | npm is the selected package manager; Nx supports affected checks/deployments and caching for independently deployable apps |
| Hosting | Cloudflare Free initially; prefer EU storage where available | Keep initial operating costs within the free tier |
| Data processing location | No EU-only processing promise | Cloudflare Free is preferred; strict regional processing is not a launch guarantee |
| Repository | Public, no license, default branch `main` | Public viewing without granting an open-source reuse license |
| Main protection | Active ruleset requires pull requests, one approval, and the `PR validation` status check; blocks direct pushes, deletions, and force pushes; repository admins may bypass | Protect the default branch while retaining the requested admin bypass |
| UI proposals | Show four variants for selection | Explicit user preference |

## Pending validation or implementation choice

| Topic | Current direction | Next step |
|---|---|---|
| Next.js on Workers | Adapter not selected; Cloudflare's [currently recommended path](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) is beta | Prototype required Next.js features and compare supported deployment paths |
| Cloudflare data location | EU storage options where supported on Free; no EU-only processing guarantee | Verify per-service plan availability and guarantees before creating production resources; see [R2 data location](https://developers.cloudflare.com/r2/reference/data-location/) |
| Nx cache | Use affected tasks and local task caching | Decide whether/when to enable remote caching |
| Token details | Custom auth with JWT or equivalent signed tokens | Specify claims, expiry, refresh, revocation, cookie/transport behavior, and CSRF protections during auth design |
| Email provider | Provider-independent delivery | Select a provider and confirm free-tier limits before implementation |
| GitHub repo | Public `Cgcnnunes/rent-hub` created; `main` pushed; `Protect main` ruleset and required PR check active | Expand PR validation to Nx quality tasks when app packages exist |
| Commit sequence | Format is `type(rent-xxxxx): description`; commit sequence is distinct from feature branch sequence | Define collision-safe allocation before enforcing in hooks/CI |
| Deployment queue | TEST deployments must queue; GitHub concurrency alone is not FIFO | Implement and test a durable serialization mechanism |
| Production history | Successful deployments must be tracked durably | Select GitHub deployment records or equivalent metadata |
