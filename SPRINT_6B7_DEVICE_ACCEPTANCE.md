# Sprint 6B.7 Device Acceptance

## Noir retirement
1. Open Design + Data.
2. Confirm Noir Gala is not listed.
3. Confirm Midnight Noir remains available.
4. When upgrading from a saved Noir selection, confirm the app opens in Midnight Noir.

## Agenda
1. Tap an empty date.
2. Tap a date containing a bill.
3. Tap a date containing a saved event.
4. Tap an item under Next 7 Days.
5. Confirm every action opens the frosted day-detail dialog.
6. Tap Edit This Day and confirm the correct date and content populate the editor.

## Contrast
Test every remaining theme:
- Design + Data heading and helper text
- all theme-card names and descriptions
- Preview Room
- Dashboard helper text and weather section
- menus, buttons, pills, inputs, selects, placeholders, status messages, and dialogs

Acceptance rule:
- dark text on light surfaces
- light text on dark surfaces
- no delayed, blank, pale, or disappearing theme-card labels

## Service worker
1. Open diagnostics after deployment.
2. Close and reopen the app once if necessary.
3. Confirm the service worker reports `sw.js` rather than “Not controlling this page yet.”
4. Confirm the app identifies itself as Sprint 6B.7.

## 25 Hard
1. Create a milestone.
2. Switch Grid/List.
3. Close and reopen the app.
4. Confirm the milestone persists.
5. Mark it complete.
6. Confirm it turns gold with dark readable text.

## Wellness regression
Open Wellness and add one glass of water. Confirm the approved page remains unchanged and stays open.
