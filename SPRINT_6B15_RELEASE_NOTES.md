# Sprint 6B.15 Corrective

## Locked scope delivered

### Bills
- Restores the original 28 bills through a one-time canonical migration.
- Merges restored and existing records, then removes exact duplicates using normalized name, amount, and due date.
- Preserves paid state and paid date.
- Keeps intentionally separate bills when amount or due date differs.
- Uses one canonical bill source across Financial Studio and dashboard summaries.

### Duplicate prevention
- Financial Studio removes legacy duplicate checklist panels.
- Executive Dashboard Agenda is rebuilt from unique calendar items and unique canonical bills.
- Calendar entries that merely repeat an existing bill are excluded from the Dashboard Agenda panel.
- Agenda itself remains on the approved 6B.14 implementation and was not redesigned.

### Dashboard synchronization
- Cash position reads current Checking, Savings, and Other Assets.
- Upcoming bill totals use canonical unique bills.
- Projected balance uses unpaid canonical bills.
- A live Morning Brief panel reflects current priorities, morning routine completion, next-seven-day Agenda count, unpaid bills, and next item.
- The existing Open Morning Brief navigation remains functional.

### Sapphire Executive
- Only Lani's Corner receives the new Sapphire contrast rules.
- Text, controls, inputs, and placeholders use dark readable colors against the light Lani surfaces.
- Agenda Sapphire styling is untouched.
- Once device-approved, Design + Data can be locked.
