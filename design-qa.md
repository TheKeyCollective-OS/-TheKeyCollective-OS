# Design QA — Emerald Crocodile + Blackberry Deco

**Source visual truth**
- Emerald: `C:\Users\keyct\.codex\generated_images\019fb102-8dc9-7942-bf20-4741c25f10c5\exec-084c6145-babd-4e40-845e-a30f0210eada.png` (1254 × 1254).
- Blackberry: `C:\Users\keyct\.codex\generated_images\019fb102-8dc9-7942-bf20-4741c25f10c5\exec-d156775b-3556-4f31-a110-9bb0beba73cb.png` (1254 × 1254).

**Rendered implementation**
- URL: `http://127.0.0.1:8766/?review=6c3-emerald-blackberry#premium`
- Screenshots: `emerald-crocodile-implementation.png`, `blackberry-deco-implementation.png` (1264 × 711 each).
- Combined comparison: `emerald-blackberry-comparison.png` (1280 × 1320).
- Browser viewport: 1264 × 711 CSS px at device scale factor 1.
- State: Color Collection expanded; each new theme selected independently.

**Full-view comparison evidence**
- Both selected source assets are used directly as global repeating backgrounds and theme-card previews.
- Emerald preserves glossy crocodile scale, deep jewel green, and champagne glints; Blackberry preserves the exact plum fan geometry and antique-gold embroidery.
- Pearl cards and navigation remain visually separated from both high-detail surfaces.

**Focused region comparison evidence**
- Theme previews use the source assets rather than CSS approximations.
- Selected outlines, page controls, sidebar text, card titles, body copy, buttons, and companion bubble remain readable.
- Slow alternate background drift adds dimensional movement without altering the selected material direction.

**Required fidelity surfaces**
- Fonts and typography: existing OS hierarchy, weights, line heights, and wrapping preserved.
- Spacing and layout rhythm: no structural changes; gallery and cards retain established responsive spacing.
- Colors and visual tokens: Blackberry uses plum/gold accents; Emerald uses green/champagne accents; light/dark semantic contrast remains intact.
- Image quality and asset fidelity: full-resolution raster sources used directly, with no placeholders or code-drawn substitutes.
- Copy and content: “Blackberry Deco” and “Emerald Crocodile” names and descriptions accurately reflect the approved visuals.

**Findings**
- No actionable P0, P1, or P2 differences.

**Open Questions**
- None.

**Primary interactions tested**
- Open Color Collection.
- Apply Blackberry Deco and verify selected state and success message.
- Apply Emerald Crocodile and verify selected state and success message.
- Confirm global theme change, preview imagery, companion visibility, and readable controls.

**Console errors checked**
- No visible runtime failure or broken interaction occurred during either tested flow.

**Comparison history**
- Pass 1: no P0/P1/P2 issues; no correction loop required.

**Implementation Checklist**
- [x] Install both selected assets.
- [x] Update global backgrounds and preview tiles.
- [x] Add distinct restrained material movement.
- [x] Update theme names and descriptions.
- [x] Update offline asset shell and cache version.
- [x] Verify both themes in browser.

**Follow-up Polish**
- None required for these two themes.

final result: passed
