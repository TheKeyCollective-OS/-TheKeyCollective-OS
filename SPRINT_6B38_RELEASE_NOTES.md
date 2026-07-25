# Sprint 6B.38 — Shared State Finalization

## Scope
This corrective build is intentionally limited to the remaining shared-state defects. Navigation, the approved Wellness Gym Time card, Fitness Tools, Dashboard layout, Financial Studio, Design + Data, and other frozen modules are not redesigned.

## Corrected
- Morning Brief Water card restored with Add, Remove, and Open Wellness Studio controls.
- Morning Brief Movement card is display-only and shows minutes versus the saved goal.
- Morning Brief Morning Reset reads the latest Sanctuary checklist state and opens Sanctuary.
- Wellness Studio Water controls now use one canonical event path.
- Wellness Studio Sobriety Tracker now uses the same day-zero calculation as the locked Executive Dashboard.
- Service-worker cache advanced to `key-collective-6b38` to prevent mixed-build assets.

## Preserved
- Wellness Gym Time controls and goal saving.
- Fitness Tools and external-link warning behavior.
- Navigation stabilization from Sprint 6B.37.
