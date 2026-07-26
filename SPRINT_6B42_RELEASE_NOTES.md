# Sprint 6B.42 — Final Source-of-Truth Lock

## Scope
This corrective build changes only Morning Brief synchronization and the sobriety reset date timezone.

## Repairs
- Morning Brief Water is display-only and reads current water and goal from Wellness Studio state.
- Morning Brief Movement is display-only and reads minutes and saved goal from Wellness Studio state.
- Morning Brief Morning Reset reads completed and total values from Sanctuary state.
- Water and Movement open Wellness Studio.
- Morning Reset opens Sanctuary.
- Daily sobriety reset dates use the device's local calendar date instead of UTC.
- Added repeated render checks and a page observer so late legacy rendering cannot overwrite the locked cards.

## Locked areas preserved
Navigation, sidebar, routing, Dashboard, Fitness Tools, styling, layouts, and external integrations were not redesigned.
