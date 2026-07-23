# Sprint 6B.13 — Agenda Restoration and Holiday Sync

## Agenda
- Rebuilt the calendar as a self-contained final renderer.
- Calendar is explicitly displayed as a seven-column grid.
- Previous and next month navigation works through December 2030.
- Date taps open an editable frosted window.
- Events, tasks, birthdays, personal holidays, national holidays, notes, and bills display on the correct dates.
- Birthdays and personal holidays recur annually.
- Colored indicators are generated from saved dated information.
- Bill due dates and paid status are read from the Financial Studio source.

## Nager.Date
- Added yearly U.S. public-holiday synchronization for 2026–2030.
- Uses the browser-ready Nager.Date v4 API.
- Results are cached locally for thirty days.
- A built-in 2026–2030 federal-holiday fallback is used when the network is unavailable.
- User-entered holidays remain separate and are merged into calendar display.

## Financial Studio
- Consolidates duplicate imported bills using name, amount, and due date.
- Preserves paid status and paid date while merging duplicates.
- Removes older duplicate bill panels from view.
- Provides one canonical bill checklist.
- Adds independent Checking, Savings, and Other Assets inputs.
- Each balance saves separately and updates the summary.

## Executive Dashboard
- Open Morning Brief uses a final capture-phase route handler.

## Frozen
- Design + Data remains frozen and approved.
- Payments Academy remains frozen and approved.
