# Sprint 6B.21 — iPhone Acceptance

Automated checks do not constitute runtime acceptance.

On the deployed iPhone PWA, confirm:

1. Edit one bill's amount and due date, tap **Save Changes**, refresh, and verify both remain saved.
2. Toggle one bill from **Still Due** to **Paid** and verify the row label and summary totals change immediately.
3. Refresh and verify the Paid status remains.
4. Toggle that bill back to **Still Due** and verify totals change immediately and remain after refresh.
5. Remove one test bill, confirm the prompt, refresh, and verify it does not return.
6. Confirm another bill with a different amount or due date was not removed.
7. Attempt to create an exact duplicate and verify it is blocked.
8. Confirm Checking and Savings remain unchanged.
