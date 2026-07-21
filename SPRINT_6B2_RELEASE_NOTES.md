# Sprint 6B.2 — Interaction Repair

This corrective release is based on the July 21 screen recording.

## Root cause repaired
Several earlier fixes targeted IDs that did not exist in the rendered UI. Sprint 6B.2 replaces those brittle overlays with page-level implementations and end-to-end interaction tests.

## Repairs
- 25 Hard uses one consistent set of IDs and handlers. Add, persist, grid/list, progress, remove, complete, and gold state are connected.
- Agenda month arrows render the next and previous months.
- Every Agenda date is a real button that opens the frosted day quick view.
- Agenda import begins with Google / Apple / file choices. Files is not opened before the source is chosen.
- Agenda export begins with a destination choice.
- Morning Brief Top Three edits in place without returning to Dashboard.
- Lani dashboard carousel is rebound to the shared IndexedDB library and advances every five seconds.
- External destinations display an in-app handoff explanation before leaving the OS.
- Dark-theme contrast safeguards are reinforced.

## Honest boundaries
- Google account import still requires a real Google OAuth client ID and authorized GitHub Pages origin.
- Apple Calendar uses .ics import/export because Apple does not expose direct browser Calendar authorization to a static site.
- External sites and apps remain outside the OS and require connectivity.
