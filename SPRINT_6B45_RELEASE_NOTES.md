# Sprint 6B.45 — Google Calendar Connection

- Connects the Agenda to Google Calendar using the approved website OAuth client.
- Syncs every visible Google calendar and retains calendar names and colors.
- Repeated syncs replace matching Google events rather than appending duplicates.
- Local Agenda events with the same date, title, and time are not repeated in the Google list.
- Creates new Google events and edits existing Google events on writable calendars.
- Keeps OAuth access tokens in memory only; tokens are not written to browser storage.
- Removes Apple Calendar connection/export controls from the Agenda experience.
- Audits every routed page after rendering for duplicate top-level sections and preserves the most complete current card.
- Prevents duplicate Google events across repeated syncs and prevents local/Google copies of the same agenda item from appearing twice.
- Preserves locked navigation, Financial Studio, Morning Brief, Wellness Studio, and other approved modules.

## Acceptance checks

- JavaScript syntax passes for the new Google and integration modules.
- All-calendar sync is identity-deduplicated.
- Read-only Google calendars are visible but excluded from the event-editor target list.
- Create and update operations use the same Google Calendar state.
- No Apple Calendar live connection is included.
