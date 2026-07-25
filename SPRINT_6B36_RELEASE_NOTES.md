# Sprint 6B.36 — Final Morning + Wellness Interaction Lock

## Scope
- Restores Wellness Studio Gym Time `-15`, `-5`, `+5`, and `+15` controls.
- Restores Gym Goal saving and persistence.
- Preserves exactly one Gym Time card.
- Repairs Morning Brief water add/remove behavior without resetting hydration.
- Preserves Morning Brief Gym Time as read-only and synchronized with Wellness Studio.
- Preserves Morning Reset synchronization and working Sanctuary count.
- Restores navigation from Water and Gym cards to Wellness Studio and from Morning Reset to Sanctuary.
- Leaves the approved sobriety tracker untouched.
- Leaves all locked modules untouched.

## Runtime strategy
Sprint 6B.36 is the only post-app corrective runtime loaded. It handles controls on pointer/touch release before legacy enhancers can replace the tapped element.
