# Villain Runtime Manual Regression

Run after every Runtime step in addition to `node tests/regression/villain-baseline.mjs`.

## Token and report

1. Open `/?token=<unused villain token>` and confirm the villain home page works.
2. Use a Token belonging to another registered test and confirm rejection.
3. Complete all 24 questions and confirm Token completion succeeds.
4. Reopen the completed URL and confirm the same report is restored.
5. Confirm hero, radar, report sections, resonance list and hidden line render correctly.

## Answers and navigation

1. Confirm every question has four options.
2. Confirm Previous and Next preserve selected answers.
3. Confirm the final button reads `查看结果` and requires an answer.

## Global public access

1. Enable the single global code and enter through `/access.html`.
2. Confirm success redirects to `/` and starts villain.
3. Disable access before entering questions; confirm the user cannot start.
4. Enter questions while enabled, then disable it; confirm the current round can finish.
5. Refresh or reopen after disabling; confirm a new round cannot start.
6. Confirm public mode does not write a `test_links` row.

## Formal URLs and presentation

1. Confirm `/` opens villain.
2. Confirm `/?token=...` remains the villain Token URL.
3. Confirm `/access.html` remains the villain public entry.
4. Confirm archive, rebate modal and report presentation at mobile and desktop widths.

## Fallback fixture note

The `personalityOrder` fallback fixture uses 24 `null` answers to exercise the defensive final branch. A completed answer sequence cannot give two different personalities the same positive `primaryHistory` last index because each question contributes exactly one primary ID. This is an internal-state baseline, not a user-completable flow.
