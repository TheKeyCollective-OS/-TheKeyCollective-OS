# Sprint 6B.4 — Identity, Continuity, and Theme Lock

Built from Sprint 6B.3 after reviewing the latest Safari and home-screen recording.

## Added
- Visible Sprint 6B.4 build badge inside the app.
- Browser vs. home-screen mode identification.
- Storage diagnostics for OS data, IndexedDB Lani photos, quota, origin, and service worker.
- One-click cache/service-worker refresh without deleting saved OS data.
- Continuity backup and restore containing both OS state and Lani photo blobs.
- Explicit explanation that iPhone may isolate Safari storage from installed-app storage.
- Central theme mutation guard to prevent older page scripts from drifting away from the selected palette.
- Updated PWA identity, scope, start URL, cache identity, and v16.4 asset set.

## Important
A static web app cannot force iOS Safari and an installed home-screen PWA to share storage containers. The included continuity backup is the reliable bridge when iOS separates them.
