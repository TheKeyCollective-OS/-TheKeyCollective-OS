#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
required=(index.html tokens.css app.css app.js config.js router.js store.js weather.js controllers.js pages.js logo.png profile.jpg manifest.webmanifest sw.js FEATURE_REGISTRY.md REGRESSION_CHECKLIST.md)
for f in "${required[@]}"; do test -f "$f" || { echo "Missing $f"; exit 1; }; done
grep -q 'href="tokens.css' index.html
grep -q 'href="app.css' index.html
grep -q 'src="app.js' index.html
grep -q 'src="logo.png"' index.html
grep -q 'src="profile.jpg"' index.html
grep -q "'./store.js'" app.js
grep -q "'./router.js'" app.js
grep -q "'./pages.js'" app.js
grep -q "'./controllers.js'" app.js
grep -q "menuScrim.*onclick" app.js
echo "Milestone 4 structural smoke test passed."
