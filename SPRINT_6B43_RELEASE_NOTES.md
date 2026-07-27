# Sprint 6B.43 — Wellness + Morning Brief Source of Truth

## Financial Studio

- Bills marked paid now record when that status was set.
- A paid bill automatically becomes available to mark paid again after 15 days.
- Existing paid bills without a prior timestamp begin their 15-day window when this build first loads.

## Sobriety

- Sobriety uses the `America/Phoenix` calendar day (Mountain Standard Time, without daylight-saving shifts).
- The saved start date persists instead of being recreated each day.
- Wellness Studio and the Executive Dashboard use the same inclusive day count.

- Replaces the competing 6B.27–6B.31 wellness and Morning Brief runtimes with one active synchronization layer.
- Keeps hydration editable in Wellness Studio and Morning Brief using one saved value.
- Restores one Gym Time card with working minute controls and a persistent daily goal.
- Makes Morning Brief Movement read-only and synchronized with Wellness Studio.
- Makes Morning Reset read the editable Sanctuary Morning Reset checklist exactly.
- Makes the Morning Brief Agenda mirror every event, task, birthday, holiday, plan, and unpaid bill due during the next seven days.
- Makes Personal Highlights display the three most recently saved voice memos from Executive Intelligence.
- Preserves the sobriety start date across local calendar days and uses an inclusive streak count.
- Repairs the older Morning Brief runtime error that prevented later enhancements from loading.
- Corrects root-level icon paths so the service worker can install the new cache successfully.
