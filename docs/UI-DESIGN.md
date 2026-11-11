# UI Design Direction

## Status and visual reference

The [refined UI concept](ui-concept.html) is a self-contained, illustrative HTML file. Download it and open it locally in a browser to explore the five themes, simulated device sizes, and example areas. It uses fictional data; business actions are disabled. It is not the application, a complete interaction specification, or evidence that accessibility or functionality has been implemented.

The concept also retains a comparison mode for earlier layout directions. Those alternatives are historical exploration, not additional selected application layouts. Where the concept and product requirements differ, [Product Requirements](PRODUCT.md) and the associated feature decisions take precedence.

## Selected shared structure

Use the Atlantic structure across desktop, tablet, and mobile: a consistent information architecture, navigation, account context, page headings, actions, summary cards, and related content panels. Adapt navigation and layout to available screen space without changing functionality or authorization between devices or themes.

Use shared, accessible components and semantic tokens for color, typography, spacing, borders, radii, focus, and component states. Verify contrast, keyboard use, focus visibility, disabled states, and non-color status cues for all themes as the application is built; the static concept does not replace those checks.

## Themes and preference

All five themes use the same structure and features. Their colors and shapes are visual directions, not fixed production values:

- **Ledger (default):** cool neutrals, navy accents, understated borders, and restrained radii.
- **Atlantic:** deep teal navigation, light surfaces, and soft teal accents.
- **Bento:** cool blue and violet accents with rounded surfaces.
- **Casa:** warm cream and coral colors with friendly rounded surfaces.
- **Dark:** charcoal and navy surfaces with teal accents and legible light text.

Persist a user's choice across sessions, devices, and account switches as specified in [Product Requirements](PRODUCT.md#selected-ui-direction-and-themes); the database is authoritative and saving failures must be visible.

## Illustrative workflows

The concept sketches the agreed direction for rooms and signers, contract conflicts and renewals, payment allocations and partial periods, deposits, maintenance costs, document upload availability, permission-aware notifications, predictions, reports, member access, and recovery. Each feature issue and the product requirements still define the actual rules and unresolved interactions. Unavailable capabilities may be shown as disabled with a clear explanation; do not imply that they already work.
