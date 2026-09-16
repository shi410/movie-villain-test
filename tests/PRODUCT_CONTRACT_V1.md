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
- `renderReport(resultPayload, context)` owns report DOM and presentation. Runtime
  passes product-owned report context through without interpreting its fields.
- `resultPayload` must be JSON serializable and sufficient to restore a report.

Platform does not define question, answer, result payload, scoring, report DOM,
copy, safety-rule, or visual schemas.

## Product lookup boundary

Platform obtains implementations with
`TestProductRegistry.getProduct(testId)`. Products register through
`registerProduct(product)`; shared code must not branch on known product IDs.

Runtime Step 3A placed villain on this boundary. Runtime Step 3B adds the
SCL-90 Product and its isolated `/scl90/` lifecycle without changing either
product's private data model.

## Current registration state

- `villain`: enabled, entry `/`, public entry `/access.html`
- `scl90`: registered but disabled, entry `/scl90/`, public entry
  `/access.html?test=scl90`

Keeping SCL-90 disabled prevents Admin Token generation and public entry until
its commercial content is explicitly cleared. This state does not change its
Product Contract implementation or local regression fixtures.

Platform Runtime requires the shared Test Registry and checks `enabled` before
entering public-access mode. The switch does not invalidate an already issued
Token or a completed historical result. Development fixture bypasses are
restricted to localhost and are not a production entry mechanism.

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
