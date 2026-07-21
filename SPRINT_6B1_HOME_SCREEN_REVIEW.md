# Sprint 6B.1 Home-Screen App Review

## Corrections made
- Added complete iPhone/iPad standalone metadata.
- Confirmed `display: standalone`, app scope, start URL, theme color, background color, and valid 192/512/180 icons.
- Corrected the service-worker app shell from stale `v=16.0` asset URLs to the actual `v=16.1` files loaded by the page.
- Added automatic service-worker update activation and refresh behavior.
- Added safe-area handling for iPhone notches and the home indicator.
- Added Dashboard, Morning Brief, and Agenda home-screen shortcuts where supported.
- Kept all local data systems available in standalone mode: localStorage and IndexedDB use the same GitHub Pages origin as Safari.
- Preserved navigation through hash routes so home-screen deep links stay inside the installed app.
- External services are intentionally network-only and are not intercepted by the offline cache.

## Expected home-screen parity
The installed home-screen app uses the same HTML, JavaScript, localStorage, IndexedDB, routes, and account configuration as the web version. Dashboard, Morning Brief, Agenda, Design & Data, Financial Studio, Wellness, 25 Hard, Growth Studio, Sanctuary, and Lani's Corner remain available.

## Honest limitations
- Live news, weather, Google authorization, Google Calendar APIs, EOS, and MyFitnessPal require an internet connection.
- Google Calendar authorization still requires the deployed OAuth client ID and authorized GitHub Pages origin.
- Apple Calendar remains an `.ics` import/export bridge; Apple does not expose direct Calendar authorization to a static web app.
- A physical iPhone installation and account authorization cannot be performed inside this offline build environment. The package is statically and programmatically verified; the final device test is documented in `HOME_SCREEN_DEVICE_TEST.md`.

## Automated certification

52 checks executed; 52 passed.

- PASS — Manifest display standalone
- PASS — Manifest scope
- PASS — Manifest start URL
- PASS — Manifest ID
- PASS — Manifest theme/background colors
- PASS — Manifest shortcuts
- PASS — Icon icons/icon-192.png 192px
- PASS — Icon icons/icon-512.png 512px
- PASS — Icon icons/apple-touch-icon.png 180px
- PASS — Manifest linked
- PASS — Apple touch icon linked
- PASS — Apple standalone capable
- PASS — Apple app title
- PASS — Apple status bar
- PASS — Mobile web app capable
- PASS — Theme color
- PASS — SW caches tokens.css?v=16.1
- PASS — SW caches app.css?v=16.1
- PASS — SW caches app.js?v=16.1
- PASS — SW caches sprint6b1final.js
- PASS — SW caches manifest.webmanifest
- PASS — SW excludes external origins
- PASS — SW navigation fallback
- PASS — SW cache version bumped
- PASS — SW update message supported
- PASS — Service worker registration
- PASS — Automatic update on focus
- PASS — Controller-change refresh
- PASS — iPhone safe-area support
- PASS — Standalone display rules
- PASS — JS syntax app.js
- PASS — JS syntax config.js
- PASS — JS syntax controllers.js
- PASS — JS syntax memo-db.js
- PASS — JS syntax news.js
- PASS — JS syntax pages.js
- PASS — JS syntax photo-db.js
- PASS — JS syntax router.js
- PASS — JS syntax sprint3.js
- PASS — JS syntax sprint4.js
- PASS — JS syntax sprint5.js
- PASS — JS syntax sprint6a.js
- PASS — JS syntax sprint6b.js
- PASS — JS syntax sprint6b1.js
- PASS — JS syntax sprint6b1final.js
- PASS — JS syntax store.js
- PASS — JS syntax sw.js
- PASS — JS syntax weather.js
- PASS — Existing test smoke-test.sh
- PASS — Existing test verify-sprint6b1.sh
- PASS — Home-screen review included
- PASS — Physical device checklist included
