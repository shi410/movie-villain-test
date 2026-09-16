# SCL-90 Private Live Regression

Use this only for the controlled pre-release verification that must persist one
real SCL-90 Token through the existing `test_links` table. It binds to localhost,
does not deploy files, and must never be exposed on a public host.

## Secret handling

Create a temporary environment file outside every project and Git directory with:

```text
SUPABASE_URL=<production project URL>
SUPABASE_SERVICE_ROLE_KEY=<production service role key>
```

Do not paste either value into chat, logs, source control, screenshots or the
browser. Delete or securely archive the file after the controlled verification.

Start the private server with explicit opt-in:

```text
$env:SCL90_LIVE_TEST="1"
$env:LIVE_ENV_FILE="<absolute private env file path>"
node tests/regression/local-live-runtime-server.mjs
```

The server runs only on `http://127.0.0.1:4174`. Its Admin-generated links are
rewritten to that localhost origin, while the unchanged production API handlers
read and write the real Supabase row.

## Required verification

1. Open `/admin.html`; select SCL-90 and generate exactly one Token.
2. Complete all 90 questions. Refresh once before completion and confirm the
   Token-scoped session draft restores.
3. Confirm the report renders, then close and reopen the same Token link twice.
4. Refresh the restored report and confirm it remains stable.
5. Read `/__live-test-state`; expected values are one generated Token, one
   successful completion and one successful use-token request.
6. In Supabase, confirm the single row has `test_id=scl90`, `used=true`,
   `result_type=scl90-report`, and JSON `result_data.testId=scl90`.
7. Confirm a villain Token is rejected at `/scl90/` and the SCL-90 Token is
   rejected at `/`.
8. Rerun villain regression and check the browser Console for product errors.

After the controlled browser run, verify database counts and opaque payload identity without
printing Token values or report content:

```powershell
$env:SCL90_LIVE_TEST='1'
$env:LIVE_ENV_FILE='D:\Private-Backups\movie-villain-scl90-live.env'
node tests/regression/scl90-live-db-check.mjs
```

Do not modify public access, create extra live Tokens, push this private
candidate, or deploy it while Commercial Rights Gate is HOLD.
