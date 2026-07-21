#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
for f in *.js; do node --check "$f" >/dev/null; done
./smoke-test.sh >/dev/null
grep -q "enhanceSprint6B1" app.js
grep -q "sprint6b1.js" sw.js
grep -q "Google Calendar opened" sprint6b1.js
grep -q "Apple Calendar file ready" sprint6b1.js
grep -q "ICS 2.0 export" sprint6b1.js
grep -q "lux-notifications" app.css
grep -q "schemaVersion:16" store.js
grep -q "Memory Highlights" pages.js
grep -q "Executive Insights" sprint6b.js
echo "Sprint 6B.1 automated verification passed."
