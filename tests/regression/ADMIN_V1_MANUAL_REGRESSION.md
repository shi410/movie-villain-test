# Platform Admin V1 Manual Regression

Run this checklist before deploying changes to `admin.html`, `js/admin.js`,
`css/admin.css`, or any Admin API. Never paste an Admin secret, full Token, or
historical result payload into screenshots, chat, source control, or logs.

## Safe local UI review

Start the isolated in-memory server:

```powershell
node tests/regression/local-admin-server.mjs
```

Open `http://127.0.0.1:4176/admin.html` and sign in with the local-only password
printed by the server. This server does not contact Production or Supabase.

Verify:

1. The login screen is the only visible view before authentication.
2. A wrong password stays on the login screen and exposes no technical error.
3. A successful login shows exactly four navigation modules:
   - 测试管理
   - 生成链接
   - 链接管理
   - 公共授权管理
4. 测试管理 derives villain and SCL-90 from `TestRegistry`, with their real
   `test_id`, description, enabled state, and entry paths.
5. 生成链接 selects a Registry product, validates a 1-1000 count, renders every
   generated link, and supports one-link and all-link copy.
6. 链接管理 shows aggregate counts, product/status filters, Token keyword
   search, safe result-type metadata, pagination, and copying without rendering
   `result_data`.
7. The historical `test_id=null` fixture appears as villain.
8. 公共授权管理 reads the one global access code and current enabled state.
9. Logout returns to the login screen and a refresh does not reopen the Admin.
10. Browser Console contains no product error.

## Responsive review

At widths near 390px and 768px, verify:

1. The sidebar becomes a drawer opened by the menu button.
2. Cards stack without horizontal page overflow.
3. Tables scroll inside their card instead of widening the page.
4. Forms, filters, buttons, and pagination remain usable.

## Production smoke (after an approved deployment only)

1. Log in through the HTTPS Production Admin page.
2. Confirm the signed session cookie is `HttpOnly`, `Secure`, and
   `SameSite=Strict`; do not record its value.
3. Confirm an unauthenticated direct call to every Admin API returns 401/403.
4. Generate one approved canary link and verify its `test_id` and entry path.
5. Read link management and confirm no full `result_data` is returned.
6. Read public access configuration and confirm it matches the pre-deploy state.
7. Do not change the public access code or enabled state during a read-only
   smoke test.
8. Re-run villain and SCL-90 critical browser flows.
