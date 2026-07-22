# Sprint 6B.5 — Stabilization Release

## Agenda
- Every calendar date and every Next 7 Days item opens a frosted detail dialog.
- Apple and Google account-connection flows were removed.
- Import now presents three choices before opening Files:
  - `.ics` calendar file
  - Key Collective Agenda JSON backup
  - sample calendar
- Export offers `.ics` and JSON.
- Bills and calendar entries are both included in the local Next 7 Days list.
- All “today” calculations use the device's local date instead of UTC.

## Wellness
- Removed mood, recovery score, wellness check-in, movement minutes, and sleep-hours sections.
- Add Water, Remove One, and Reset update in place.
- Wellness is isolated from legacy interaction enhancers so water actions cannot redirect to Dashboard.

## Themes and text
- Added a global foreground system for headings, paragraphs, labels, inputs, placeholders, menus, cards, dialogs, and generated content.
- Text switches to light-on-dark or dark-on-light according to the active theme.
- 25 Hard completed tiles retain dark readable text on their gold background.

## Dashboard
- Today + Next 7 Days is rebuilt using the device's local date, fixing late-evening Phoenix omissions.

## Build
- Build identity: Sprint 6B.5
- Asset set: v16.5
- Service-worker cache: key-collective-canonical-6b5-v22
