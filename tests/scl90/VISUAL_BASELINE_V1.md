# SCL-90 Visual Baseline V1

Development-only baseline for Template 2. Reference screenshots remain outside Git.

- Mobile verification widths: 375, 390, 402 CSS px.
- Desktop verification width: 956 CSS px; report content is capped at 956 px with 22 px outer padding.
- Mobile report uses a four-column factor table and single-column detail cards.
- At 760 px, the minimum width that can hold five usable overview cards, report overview changes to a 5×2 grid and detail copy changes to two columns.
- The radar chart is native SVG with nine axes. `additional` is excluded.
- Severity colors are centralized in `scl90/css/scl90.css` and remain visually adjustable.
- All files in `fixtures/` are development visual data and must not enter production scoring.
