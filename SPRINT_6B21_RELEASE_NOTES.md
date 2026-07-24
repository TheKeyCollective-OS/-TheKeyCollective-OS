# Sprint 6B.21 — Bill Actions Corrective

This corrective build changes only the Financial Studio bill action layer.

## Fixed
- Every stored bill receives a stable unique identifier before actions are bound.
- Remove permanently deletes only the selected bill after confirmation.
- Save Changes persists name, amount, due date, category, and frequency.
- Paid / Still Due updates immediately and persists with a paid date.
- Paid, still-due, total, and bill-count summaries update in real time.
- Exact duplicate bills remain blocked.
- Bill actions preserve the current page scroll position.
- Delegated event handling remains active even when the bill list rerenders.

## Unchanged
- Checking and Savings design and behavior.
- Financial Studio bill-list design.
- Executive Dashboard and all frozen pages.
