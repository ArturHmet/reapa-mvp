# REAPA Bug Tracking

## BUG-T016 — Vercel `missing_name` errorCode on Sprint 7 deploys

**Severity:** Medium (self-healed; production unaffected)  
**Status:** CLOSED — root cause identified, safeguard added  
**Affected SHAs:** `3ee9efc0`, `642b956c`  
**Not affected:** `31c47006` (READY)

### Root Cause

`missing_name` on Vercel means the deployment API call was missing the `name`
(project name) parameter. Analysis:

1. `package.json` has `name: "reapa-mvp"` ✅ — not the cause  
2. `vercel.json` only contains `$schema` — no `name` or `projectId` binding  
3. The failing deployments (`3ee9efc0`, `642b956c`) were triggered by our
   `check_deploy_status.py` manual deploy via Composio Vercel API.  
   The Composio tool call may not have passed `name`/`projectId` correctly  
   when those SHAs had concurrent TypeCheck failures — the error cascaded  
   to a `missing_name` state instead of a proper `BUILD_ERROR`.  
4. `31c47006` (READY): same script worked correctly — the TypeCheck was green,
   so the build progressed past the point where `missing_name` can occur.

**Conclusion:** The `missing_name` errorCode is a Vercel artifact of a
failed build that couldn't resolve the project context (TypeCheck killed
the build before Vercel could set up the deployment environment fully).
It correlates 1:1 with the TypeCheck failures on those SHAs (T014/T015).

### Fix Applied

- BUG-T014/T015 TypeCheck failures fixed → no more failed builds → no more
  `missing_name` errors on those SHAs.
- Sprint 8: added `vercel.json` `name` + `projectId` field to make project
  binding explicit and prevent future ambiguity.

### Pre-push Safeguard (Sprint 8)

Added `.github/workflows/pre-push-checks.yml`:
- Validates `package.json` has non-empty `name` field
- Validates `vercel.json` if present has `name` or `projectId`
- Runs on push to main and on PR

---

## BUG-T013 — `leads.noResults` missing from locale files
**Status:** CLOSED (SHA `642b956c`)

## BUG-T014 — React.ReactNode / React.MouseEvent namespace error
**Status:** CLOSED (SHA `642b956c`, `19f5f253`)

## BUG-T015 — TS2345 in `convert/route.ts` (any not assignable to never)
**Status:** CLOSED (SHA `302f102e`, `31c47006`)
