# Sprint 6B.37 — Navigation + Wellness Stabilization

## Scope
- Removed the Sprint 6B.36 capture-level pointer/touch/click interception from the active runtime.
- Restored one normal bubbling click path for app controls.
- Exposed the core router for reliable internal navigation.
- Added a route-rendered lifecycle event so page-specific controls bind after rendering without a global MutationObserver.
- Stabilized Wellness Studio water, gym time, gym goal, and sobriety display.
- Preserved external MyFitnessPal and EOS links as native links.
- Updated service-worker cache behavior and version to prevent mixed JavaScript/HTML builds.

## Locked modules
No visual or data-model changes were made to locked modules.
