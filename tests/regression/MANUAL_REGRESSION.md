# Platform Runtime Manual Regression

Run after every Runtime step in addition to `node tests/regression/villain-baseline.mjs`.

For isolated local Runtime testing, start:

```text
node tests/regression/local-runtime-server.mjs
```

Then use `http://127.0.0.1:4173/`. The server keeps all Token and public-access
state in memory and never connects to Supabase. Available fixtures are:

- `?token=valid-unused`
- `?token=wrong-test`
- `?token=completed`
- `?token=legacy-completed`
- `/scl90/?token=scl-valid-unused`
- `/scl90/?token=scl-completed`
- public access code `OPEN`

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
7. Open `/access.html?test=scl90`; while SCL-90 is disabled, confirm its name is
   shown and public entry remains blocked.
8. Enter villain with the global code, then directly open `/scl90/`; confirm the
   carried public session cannot bypass the disabled SCL-90 definition.

## SCL-90 local integration

1. Open `/scl90/?token=scl-valid-unused` and confirm the home page loads.
2. Confirm the Token is preserved when navigating to `test.html`.
3. Complete all 90 questions and confirm `/api/use-token` receives
   `testId: scl90`, `resultType: scl90-report`, and the opaque SCL-90 payload.
4. Open the generated report link and confirm the completed Token restores the
   full report through the SCL-90 renderer.
5. Reopen `/scl90/?token=scl-completed` and confirm it dispatches to the SCL-90
   report rather than villain.
6. Confirm a villain Token is rejected at the SCL-90 entry.
7. Confirm fixture URLs bypass Platform authorization only on localhost; the
   same query parameters on a non-local hostname must follow normal Runtime
   authorization.
8. Confirm Admin lists villain only while SCL-90 remains disabled.

## Formal URLs and presentation

1. Confirm `/` opens villain.
2. Confirm `/?token=...` remains the villain Token URL.
3. Confirm `/access.html` remains the villain public entry.
4. Confirm `/access.html?test=scl90` resolves the SCL-90 public entry without
   changing the default villain route.
5. Confirm archive, rebate modal and report presentation at mobile and desktop widths.

## Fallback fixture note

The `personalityOrder` fallback fixture uses 24 `null` answers to exercise the defensive final branch. A completed answer sequence cannot give two different personalities the same positive `primaryHistory` last index because each question contributes exactly one primary ID. This is an internal-state baseline, not a user-completable flow.
