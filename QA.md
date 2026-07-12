# FleetFlow — Manual QA / Feature Verification Checklist

> Use this to manually walk the running app (frontend + backend together) against the original problem statement before calling it done. Check items off as you verify them; anything left unchecked at submission time is a known gap, not a surprise.
>
> **Open item carried over from spec review:** role naming ("Driver" vs "Dispatcher") and the exact RBAC matrix were flagged as inconsistent between the backend and frontend prompts — confirm which was actually implemented before checking off the RBAC items below, since "correct" depends on which version you built.

---

## 0. Setup Sanity Checks
- [ ] Backend server starts cleanly, connects to PostgreSQL
- [ ] `docker-compose up` (or equivalent) brings up API + DB with no errors
- [ ] Seed data present: 4 roles, at least one demo user per role, a few sample vehicles/drivers
- [ ] Frontend starts cleanly and successfully calls the backend (no CORS/env misconfig)

---

## 1. Authentication & RBAC (Spec 3.1)
- [ ] Login with valid email + password succeeds
- [ ] Login with invalid credentials is rejected with a clear error message
- [ ] Unauthenticated requests to any protected page/API are blocked (test by hitting a route directly with no token — not just checking the UI hides a link)
- [ ] Session/JWT persists across a page refresh
- [ ] Logout clears the session and returns to login
- [ ] All 4 roles can log in successfully
- [ ] Each role sees only the modules it's permitted (verify against whichever RBAC matrix was actually implemented)
- [ ] A role attempting a forbidden **API call directly** (Postman/curl), not just a hidden UI button, gets a `403` — RBAC enforced server-side

---

## 2. Dashboard (Spec 3.2)
- [ ] KPI — Active Vehicles: count is correct
- [ ] KPI — Available Vehicles: count is correct
- [ ] KPI — Vehicles in Maintenance: count is correct
- [ ] KPI — Active Trips: count is correct
- [ ] KPI — Pending Trips: count is correct
- [ ] KPI — Drivers On Duty: count is correct
- [ ] KPI — Fleet Utilization (%): value matches the formula actually used, and is internally consistent with the vehicle status counts
- [ ] Filter by **vehicle type** updates the relevant KPIs/lists
- [ ] Filter by **status** updates the relevant KPIs/lists
- [ ] Filter by **region** updates the relevant KPIs/lists
- [ ] KPIs reflect a state change (e.g. dispatching a trip) without requiring a manual hard refresh, or at minimum update correctly on refresh

---

## 3. Vehicle Registry (Spec 3.3)
- [ ] Create vehicle captures: Registration Number, Name/Model, Type, Max Load Capacity, Odometer, Acquisition Cost, Status
- [ ] **Duplicate registration number is rejected** (Rule 1)
- [ ] List view shows all vehicles with correct field values
- [ ] Edit vehicle works and persists changes
- [ ] Delete / Retire vehicle works
- [ ] Status is restricted to exactly: `Available`, `On Trip`, `In Shop`, `Retired` — no free text or invalid values reach the DB
- [ ] Status **cannot be manually set** to `On Trip` or `In Shop` from a create/edit form — those are system-derived only

---

## 4. Driver Management (Spec 3.4)
- [ ] Create driver captures: Name, License Number, License Category, License Expiry Date, Contact Number, Safety Score, Status
- [ ] List view shows all drivers with correct field values
- [ ] Edit driver works and persists changes
- [ ] Delete / deactivate driver works
- [ ] Status is restricted to exactly: `Available`, `On Trip`, `Off Duty`, `Suspended`

---

## 5. Trip Management + Business Rules (Spec 3.5 + Section 4, Rules 1–8)
- [ ] Create trip (→ `Draft`) captures: source, destination, vehicle, driver, cargo weight, planned distance
- [ ] Vehicle dropdown at trip creation shows **only** available vehicles
- [ ] **Retired vehicle never appears** in the dispatch/vehicle selection (test explicitly: retire a vehicle, confirm it vanishes from the dropdown)
- [ ] **In Shop vehicle never appears** in the dispatch/vehicle selection (test explicitly: open a maintenance record on a vehicle, confirm it vanishes)
- [ ] Driver dropdown shows **only** available drivers
- [ ] Driver with an **expired license** cannot be selected/assigned (test with a seeded expired-license driver)
- [ ] **Suspended** driver cannot be selected/assigned
- [ ] Vehicle already `On Trip` **cannot** be double-booked onto a second trip
- [ ] Driver already `On Trip` **cannot** be double-booked onto a second trip
- [ ] Cargo weight **exceeding** vehicle max load capacity blocks trip creation/dispatch with a clear error
- [ ] Cargo weight **exactly equal** to capacity is allowed (boundary case — rule is `≤`, not `<`)
- [ ] **Dispatch**: `Draft → Dispatched` transition succeeds
- [ ] **Dispatch**: vehicle status auto-flips to `On Trip`
- [ ] **Dispatch**: driver status auto-flips to `On Trip`
- [ ] **Complete**: requires final odometer reading + fuel consumed as input
- [ ] **Complete**: `Dispatched → Completed` transition succeeds
- [ ] **Complete**: vehicle status auto-reverts to `Available`
- [ ] **Complete**: driver status auto-reverts to `Available`
- [ ] **Cancel a Dispatched trip**: status → `Cancelled`, vehicle & driver restored to `Available`
- [ ] **Cancel a Draft trip**: works cleanly with no vehicle/driver side effects (nothing was locked yet)
- [ ] Illegal transitions are blocked (e.g. a `Completed` or `Cancelled` trip cannot be dispatched again)
- [ ] Spot-check for race conditions: two rapid dispatch attempts on the same vehicle/driver — only one should win, not both

---

## 6. Maintenance + Business Rules (Spec 3.6 + Section 4, Rules 9–10)
- [ ] Create a maintenance record for a vehicle, capturing service type/cost/date
- [ ] Creating an **active** maintenance record auto-sets vehicle status to `In Shop`
- [ ] A vehicle `In Shop` is confirmed absent from the Trip Management vehicle selection pool (cross-check against Section 5 above — this is the same rule tested from the other side)
- [ ] Closing a maintenance record reverts vehicle status to `Available`
- [ ] Closing a maintenance record on a vehicle that is `Retired` does **not** revert it to `Available` — it stays `Retired` (exception case)
- [ ] Multiple maintenance records per vehicle are supported and all listed correctly

---

## 7. Fuel & Expense Management (Spec 3.7)
- [ ] Log a fuel entry: liters, cost, date all captured and linked to a vehicle
- [ ] Log a non-fuel expense (toll, misc): type, amount, date captured
- [ ] **Total operational cost per vehicle = Fuel + Maintenance**, computed automatically (not manually entered)
- [ ] Operational cost figure updates immediately after adding a new fuel log or maintenance cost — no stale totals

---

## 8. Reports & Analytics (Spec 3.8)
- [ ] Fuel Efficiency = Distance / Fuel, correct per vehicle
- [ ] Fleet Utilization % here matches the same figure shown on the Dashboard (no drift between the two)
- [ ] Operational Cost report matches the totals shown in the Fuel & Expense module
- [ ] Vehicle ROI = `(Revenue − (Maintenance + Fuel)) / Acquisition Cost`, computed correctly
- [ ] **CSV export works** and the file opens correctly with accurate data (this one's mandatory, not optional)
- [ ] PDF export — if built, confirm it produces a valid file; if not built, that's fine since it's explicitly optional

---

## 9. End-to-End Example Workflow (Spec Section 5 — run literally, top to bottom)

Run this as one continuous session; it catches integration bugs that isolated module tests miss.

- [ ] **Step 1:** Register vehicle "Van-05," max capacity 500 kg → Status = `Available`
- [ ] **Step 2:** Register driver "Alex" with a valid, non-expired license
- [ ] **Step 3:** Create a trip with Cargo Weight = 450 kg
- [ ] **Step 4:** System validates 450 kg ≤ 500 kg — no blocking error, dispatch is allowed
- [ ] **Step 5:** Dispatch the trip → Vehicle and Driver status both automatically become `On Trip`
- [ ] **Step 6:** Complete the trip, entering the final odometer reading and fuel consumed
- [ ] **Step 7:** System marks both Vehicle and Driver `Available` again
- [ ] **Step 8:** Create a maintenance record (e.g. "Oil Change") on Van-05 → status automatically becomes `In Shop` and it disappears from the dispatch pool
- [ ] **Step 9:** Reports (Fuel Efficiency, Operational Cost) reflect the trip and fuel log just created

---

## 10. Expected Database Entities (Spec Section 6)
- [ ] `Users` table/model exists and is populated
- [ ] `Roles` (table or enum) exists with all 4 roles represented
- [ ] `Vehicles` table exists with all required fields
- [ ] `Drivers` table exists with all required fields
- [ ] `Trips` table exists with all required fields
- [ ] `Maintenance Logs` table exists
- [ ] `Fuel Logs` table exists
- [ ] `Expenses` table exists
- [ ] Relations are correctly wired: Trips↔Vehicles, Trips↔Drivers, Fuel Logs↔Vehicles, Maintenance Logs↔Vehicles, Expenses↔Vehicles

---

## 11. Mandatory Deliverables (Spec Section 7)
- [ ] Responsive web interface (check mobile width, tablet width, desktop width — not just desktop)
- [ ] Authentication with RBAC, fully functional and server-enforced
- [ ] CRUD for Vehicles — all four operations work
- [ ] CRUD for Drivers — all four operations work
- [ ] Trip Management with validations (every rule from Section 5 above enforced, not just the happy path)
- [ ] Automatic status transitions (vehicle/driver/trip — every rule from Section 4)
- [ ] Maintenance workflow (open/close, automatic vehicle status sync)
- [ ] Fuel & Expense tracking (logging + automatic cost computation)
- [ ] Dashboard with KPIs (all 7 KPIs present, accurate, and filterable)

---

## 12. Bonus Features (Spec Section 8) — verify only if time permits, not blocking for submission
- [ ] Charts and visual analytics (Dashboard vehicle status chart, Analytics revenue/cost charts)
- [ ] PDF export
- [ ] Email reminders for expiring driver licenses
- [ ] Vehicle document management (upload/view documents per vehicle)
- [ ] Search, filters, and sorting across Fleet/Drivers/Trips tables
- [ ] Dark mode — note: if the base UI is dark-by-default with no toggle, that's a design choice, not the same as a working light/dark **toggle**; confirm which one was actually built before checking this off

---

## 13. Cross-Cutting / Non-Functional Checks
- [ ] Rule violations return clear, human-readable error messages — not raw stack traces or generic 500s
- [ ] No console errors on any page load or core action
- [ ] API responses use a consistent success/error shape across all endpoints
- [ ] Protected endpoints reject unauthenticated/unauthorized requests even when called directly, not just when the UI hides the option
- [ ] Role naming ("Driver" vs "Dispatcher") is consistent between backend code and frontend UI — pick one, confirm it's used everywhere
- [ ] The RBAC permission matrix enforced by the backend matches what the frontend actually shows/hides per role — no cases where the UI shows a button the API then rejects, or hides one the API would've allowed

---

## Submission Readiness Summary

| Section | Status (Pass / Partial / Fail) | Notes |
|---|---|---|
| 1. Auth & RBAC | | |
| 2. Dashboard | | |
| 3. Vehicle Registry | | |
| 4. Driver Management | | |
| 5. Trip Management + Rules | | |
| 6. Maintenance + Rules | | |
| 7. Fuel & Expense | | |
| 8. Reports & Analytics | | |
| 9. E2E Workflow | | |
| 10. DB Entities | | |
| 11. Mandatory Deliverables | | |
| 12. Bonus Features | | |
| 13. Cross-Cutting | | |