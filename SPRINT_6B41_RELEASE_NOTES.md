# Sprint 6B.41 Release Notes

## Morning Brief Source-of-Truth Lock

Sprint 6B.41 completes the remaining Morning Brief synchronization work without changing navigation, styling, routing, Dashboard, Fitness Tools, or external integrations.

### Morning Brief

- Water is now display-only and reads directly from Wellness Studio shared state.
- Water shows glasses consumed versus the hydration goal.
- Water includes an Open Wellness Studio button.
- Movement is now display-only and reads directly from Wellness Studio shared state.
- Movement shows minutes moved versus the saved gym goal.
- Movement includes an Open Wellness Studio button.
- Morning Reset reads directly from Sanctuary's editable Morning Reset checklist.
- Morning Reset shows completed items versus total items.
- Morning Reset includes an Open Sanctuary button.

### Architecture

Morning Brief no longer owns or edits hydration, movement, or reset completion. Wellness Studio owns hydration and movement. Sanctuary owns Morning Reset completion.
