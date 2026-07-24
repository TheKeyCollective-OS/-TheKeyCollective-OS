# Sprint 6B.16 Corrective

## Locked scope delivered

### Executive Dashboard
- Removes the added Morning Brief summary card from the bottom of the Dashboard.
- Keeps the working Open Morning Brief navigation elsewhere.
- Refreshes financial cards from Checking, Savings, Other Assets, and canonical unique bills.
- Removes repeated rows from the Dashboard Agenda panel.

### Bills
- Runs a new one-time canonical migration using the original 28-bill source.
- Replaces corrupted or duplicated bill storage with one clean canonical set.
- Preserves compatible paid status and user edits when a unique original bill match can be identified.
- Keeps separate obligations when their amount or due date differs.
- Removes older duplicate Financial Studio checklist panels.
- Guarantees one visible canonical checklist.

### Agenda
- No layout, data, color, editor, holiday, or navigation redesign.
- The only Agenda change is a transparent native date control positioned over the visible month-and-year button.
- Tapping the month-and-year control opens the device's native calendar picker.
- Existing 6B.14 month-jump behavior handles the selected date.

### Sapphire Executive
- Strengthens dark-text contrast in Lani's Corner only.
- Includes the page heading, subtitle, cards, labels, controls, inputs, and native input text.
- Sapphire Agenda is untouched.
