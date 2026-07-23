# Sprint 6B.1 Final — Corrective Connected Experience

This release is based on the user-tested Sprint 6B.1 ZIP and focuses on reliability.

## Delivered
- Agenda date taps open a frosted day quick-view modal.
- Agenda month arrows remain active through rerenders.
- Import now asks: Google Calendar, Apple Calendar, or .ics file.
- Export now asks for a destination instead of silently downloading.
- Standards-compatible .ics import and export.
- Google Calendar selected-day handoff.
- Optional real Google Calendar account import after a valid OAuth client ID is configured in `config.js`.
- Honest Apple Calendar file bridge; no false claim of browser-based Apple authorization.
- Shared Lani IndexedDB photos on the dashboard, with arrows and five-second automatic rotation.
- 25 Hard add/save/persist, grid/list switching, progress, removal, completion, and gold achievement state.
- Morning Brief Top Three edits in place without redirecting.
- EOS and MyFitnessPal reference cards in Wellness.
- Financial Studio luxury emerald depth treatment without changing its structure.
- retired legacy theme, Sapphire Executive, Emerald, and Royal Ivory contrast rules reinforced.
- Growth Studio intentionally unchanged.

## Required deployment configuration
Google account authorization requires:
1. A Google Cloud project.
2. Google Calendar API enabled.
3. A browser OAuth client ID.
4. The deployed GitHub Pages origin added to Authorized JavaScript origins.
5. The client ID copied into `window.KEY_COLLECTIVE_CONFIG.googleCalendarClientId` in `config.js`.

Apple does not provide a browser OAuth API for reading a user’s Apple Calendar. This build supports reliable .ics import/export and an app-opening handoff only.
