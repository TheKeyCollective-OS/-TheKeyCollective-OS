# Sprint 6B.6 — Component Contrast and Final Stabilization

## Component contrast engine
- Measures each component's effective rendered background.
- Classifies surfaces as light or dark using relative luminance.
- Applies dark text to light surfaces and light text to dark surfaces.
- Re-runs after theme changes, dynamic rendering, style changes, and device resizing.
- Covers cards, buttons, navigation, forms, dialogs, modules, calendar cells, status cards, Dashboard panels, and generated content.

## Design + Data
- Dedicated contrast treatment for the page heading, Preview Room, theme cards, theme names, descriptions, typography packs, selects, backup controls, and autosave/status messaging.
- Palette previews retain their intended visual colors without inheriting unrelated page text rules.
- Explicit fallbacks prevent pale text while the component classifier initializes.

## Accessibility
- Inputs and placeholders receive surface-aware foregrounds.
- Focus indicators remain visible on light and dark backgrounds.
- Disabled controls remain readable.
- Gold 25 Hard completion tiles retain dark text.

## Build identity
- Sprint 6B.6
- Assets v16.6
- Service-worker cache `key-collective-canonical-6b6-v23`
