# Test Product Contract V1

`js/platform/product-contract.js` is the executable source of truth for the
minimum Product Contract shared by Platform and test products.

## Required product interface

```js
{
  test_id,
  score(answers),
  getResultType(resultPayload),
  renderReport(resultPayload, context)
}
```

- `test_id` is immutable product identity and must remain stable.
- `score(answers)` owns the product's private answer model and returns opaque
  `resultPayload`.
- `getResultType(resultPayload)` supplies the stable `result_type` that the
  existing completion API persists separately from `result_data`.
- `renderReport(resultPayload, context)` owns report DOM and presentation.
- `resultPayload` must be JSON serializable and sufficient to restore a report.

Platform does not define question, answer, result payload, scoring, report DOM,
copy, safety-rule, or visual schemas.

## Product lookup boundary

Platform obtains implementations with
`TestProductRegistry.getProduct(testId)`. Products register through
`registerProduct(product)`; shared code must not branch on known product IDs.

Runtime Step 2 creates this boundary but does not load it from production HTML
or switch the existing villain runtime.

## SCL-90 private boundary

The SCL-90 product line may exclusively create and edit:

- `tests/scl90/**`
- `scl90/**`
- `images/scl90/**`

It must not independently edit Platform-owned shared files, including:

- `js/platform/**`
- `tests/definitions.js`
- `tests/registry.js`
- `api/**`
- `js/access.js`
- `js/admin.js`
- `admin.html`
- Supabase schema or configuration
- `tests/villain/**`, `js/app.js`, or other villain product files

Platform owns final product registration and public runtime integration.
