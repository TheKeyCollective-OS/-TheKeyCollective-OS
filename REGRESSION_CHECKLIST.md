# Release Regression Checklist

Before every GitHub-ready release:

1. Open app in desktop Chromium and mobile viewport.
2. Open mobile menu, tap the dark negative space, confirm menu closes.
3. Verify Back, Home, theme toggle, and all navigation items.
4. Verify dark theme text remains readable on cards, inputs, and buttons.
5. Add calendar event; verify month agenda, next-7-days, and dashboard update.
6. Add bill; verify current cash, bills, and projected balance update.
7. Upload Lani photo; verify slideshow cycles and survives reload.
8. Verify share snapshot excludes medication/allergy details.
9. Tap same journal category repeatedly; verify prompt changes before cycling.
10. Save journal entry and verify dated timeline.
11. Export data, import it, and verify records remain.
12. Confirm v4 storage migration does not erase data.
13. Confirm no JavaScript syntax errors and no uncaught console errors.
14. Confirm external services never display fake live data.


## Milestone 3 — Lani’s Corner
- Dedicated readable pink/lavender visual world in both themes
- Auto-rotating living photo collage with manual controls and thumbnails
- On-device photo resizing and 18-photo browser limit
- Editable fun facts, gift guide, and private care details
- Screenshot/print-friendly favorites snapshot excluding medications and allergies
- Memory timeline, swim checklist, and weekly prep checklist

## Milestone 4 Money Tests
- [ ] Account balances save and remain after refresh
- [ ] Available cash, bills, projected balance, surplus, and net worth calculate correctly
- [ ] Bill add, edit, paid status, and delete work
- [ ] Bill list sorts by due date
- [ ] Savings goals accept contributions and stop at target
- [ ] Completed savings goals add a recent win
- [ ] Sinking funds accept contributions and persist
- [ ] Cash-flow chart renders in Royal Ivory and Onyx Night
- [ ] Dashboard cash values reflect Money Studio changes
- [ ] Data Vault export contains all Money Studio data


## Milestones 5–7
- [ ] Daily Brief opens and renders Top Three, calendar, and smart signals
- [ ] Weekly Review saves and persists after refresh
- [ ] Global search finds information from each supported module
- [ ] Exported backup can be imported
- [ ] Restore Previous Save recovers the prior state
- [ ] Data Health reports Healthy for valid data
- [ ] Offline banner appears when network is disabled
- [ ] Core pages remain available after a cached reload
- [ ] Reduced motion is respected when enabled at OS level
