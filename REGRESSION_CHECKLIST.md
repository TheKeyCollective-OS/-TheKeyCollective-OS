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
