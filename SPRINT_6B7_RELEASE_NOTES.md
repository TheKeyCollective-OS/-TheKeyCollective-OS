# Sprint 6B.7 — Interaction and Contrast Closure

## Theme retirement
- retired legacy theme has been removed from the Design + Data gallery.
- Existing `noir` state is migrated automatically to Midnight Noir.
- Midnight Noir is the official dark replacement.
- Legacy Noir styling is inert and exists only as a brief migration fallback.

## Agenda
- One capture-phase delegated date handler now owns every calendar date and Next 7 Days tap.
- Competing legacy click handlers are stopped before they can cancel or replace the action.
- The frosted day-detail dialog includes events, tasks, birthdays, holidays, notes, and bills.
- Empty dates also open correctly.
- Edit This Day continues into the Agenda editor.

## Contrast closure
- Transparent and gradient backgrounds are blended with their ancestor surfaces before luminance classification.
- Hex, RGB, RGBA, gradient, and translucent surface colors are supported.
- Theme cards are classified twice after rendering and receive an immediate readable fallback.
- Light surfaces use dark text; dark surfaces use light text.

## Service worker
- Registration uses an explicit repository-root scope.
- The build waits for the active service worker and performs one controlled reload when the first page is not yet controlled.
- The reload guard prevents loops.
- Build cache: `key-collective-canonical-6b7-v24`.

## 25 Hard
- The create, persistent storage, completion, and gold-state code paths remain active.
- Completed gold tiles are explicitly classified as light surfaces with dark readable text.

## Wellness
- Wellness is approved and unchanged.
- It remains included only in regression checks.
