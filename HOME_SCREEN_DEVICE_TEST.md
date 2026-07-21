# Home-Screen Device Test

After deploying the ZIP contents to GitHub Pages:

1. Open the deployed site in Safari.
2. Refresh once and wait five seconds so the current service worker activates.
3. Tap Share → Add to Home Screen.
4. Launch **Key Collective** from the new icon.
5. Confirm there is no Safari address bar and the app opens on the Executive Dashboard.
6. Visit every module from the sidebar.
7. Save one harmless test item in Agenda and one milestone in 25 Hard.
8. Close the app completely, reopen it, and confirm both items remain.
9. Upload or view a Lani photo and confirm it appears on the Dashboard and rotates.
10. Turn on Airplane Mode and reopen the app. The app shell and locally saved information should still open; live services should show their normal unavailable/fallback behavior.
11. Restore connectivity and reopen the app.
12. Test Google authorization only after the OAuth client ID and GitHub Pages origin are configured.
13. Export an `.ics` file and open it in Apple Calendar to confirm the file bridge.

A pass means the installed app provides the same locally available modules and saved data as Safari. Network-only integrations naturally require connectivity.
