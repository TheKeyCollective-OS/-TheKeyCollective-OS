# Sprint 6B.1 — Verified Connected Experience

## Completed
- Executive Intelligence and Morning Brief remain grounded only in private OS data; no news feed is rendered.
- Premium frosted notifications and button press feedback are applied globally.
- Sanctuary and all dark palettes use a defined ivory/gray/gold typography hierarchy with dark glass inputs.
- Growth Studio achievements receive staged entrance polish.
- Palette selection, compact palette layout, luxury naming, selection state, and celebration remain active.
- Dashboard/Lani photo vault synchronization remains active.
- Agenda quick view, local ICS import, standards-compliant ICS 2.0 export, Google event handoff, and Apple Calendar file handoff are included.
- Schema upgraded to v16 without replacing existing user data.
- Service-worker cache upgraded so GitHub Pages receives the new files.

## Calendar scope — important
Google Calendar supports a working browser handoff for a selected day and complete-calendar ICS import. Apple Calendar supports complete-calendar ICS handoff. These are the reliable integrations possible in a static GitHub Pages app.

Live unattended two-way synchronization is not claimed. Google OAuth requires a configured Google Cloud client ID and authorized origin. Apple does not offer an equivalent public browser OAuth calendar API; live iCloud/CalDAV synchronization requires a secure server-side connector. The app deliberately avoids collecting calendar credentials in browser storage.
