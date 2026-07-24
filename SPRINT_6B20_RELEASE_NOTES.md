# Sprint 6B.20 Corrective

## Root-cause correction
The previous Financial Studio enhancers never ran because the legacy Financial Studio controller threw an error before the corrective renderer was reached. Sprint 6B.20 removes that failing controller from the Financial Studio route and makes the required controls part of the page's initial HTML.

## Financial Studio
- Adds separate Checking and Savings balance inputs.
- Saves both balances and updates shared available cash.
- Adds one complete bill list directly to the Financial Studio page.
- Supports adding, editing, removing, changing amount/due date/category/frequency, and Paid/Still Due status.
- Updates totals immediately.
- Blocks exact duplicate bills and consolidates exact duplicate records already in storage.

## Executive Dashboard
- Removes the bottom Payments Academy card.
- Removes the bottom Executive Intelligence card.
- Preserves their module-navigation buttons and full pages.
- Replaces Gym Minutes in Wellness Today with Days Sober from the shared Sobriety Tracker.
- Uses final-render cleanup plus a mutation observer so older enhancers cannot reinsert the removed cards.

## Protected pages
No Sprint 6B.20 route code runs on Wellness Studio or any other frozen page.
