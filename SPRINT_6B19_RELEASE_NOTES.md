# Sprint 6B.19 Financial Studio Corrective

This build changes Financial Studio only.

- Adds a permanent Full Bill List mount at the bottom of the Financial Studio page renderer.
- Shows every saved bill in one editable list.
- Supports adding bills.
- Supports editing bill name, amount, due date, category, and frequency.
- Supports marking bills Paid or Still Due.
- Supports removing bills with confirmation.
- Recalculates Paid, Still Due, Total, and bill-count summaries after each change.
- Uses the existing shared `state.bills` store so other app surfaces continue reading the same financial data.
- Removes older competing bottom bill-list panels before rendering the final list.
- Re-renders after older Financial Studio enhancers finish so the final list cannot be displaced by delayed legacy code.

No other page is changed by Sprint 6B.19.
