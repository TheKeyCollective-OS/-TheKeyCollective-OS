# Sprint 6B.40 Final Corrective Shared-State Lock

## Scope
Final Sprint 6B corrective build. No new features and no redesign.

## Corrected
- Morning Brief Water Add and Remove now write to the canonical `state.water` value.
- Wellness Studio Water Add, Remove, and Reset use the same canonical hydration value.
- Morning Brief Movement is read-only and displays minutes, goal, and progress from Wellness Studio state.
- Wellness Studio Gym Time buttons update canonical movement minutes immediately.
- Gym goal saves to `state.wellness.gymGoalMinutes` and persists through the existing store.
- Sanctuary Morning Reset writes one canonical checklist snapshot and Morning Brief reads it immediately.
- Wellness Studio sobriety uses the same inclusive reset-date calculation as the approved Executive Dashboard.
- Added the final layer to the offline application cache.

## Locked Areas Preserved
- Navigation and sidebar
- Executive Dashboard layout
- Financial Studio
- Wellness Studio layout
- Fitness Tools layout
- Routing
- Styling
- MyFitnessPal and EOS Fitness integrations
