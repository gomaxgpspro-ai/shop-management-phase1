# Employee Module Update

Updated Employee module in the existing React + Vite project while retaining the shared Customer/Vendor People page and current Local Storage data keys.

## Employee list
- Search by employee name or phone number.
- Status filter: All / Active / Inactive; salary filter: All / Paid / Unpaid.
- Profile photo, designation/category, phone, employee due, salary status, active status and View/Edit/Delete actions.
- Quick status toggle and employee-list Excel report download.

## Employee profile
- Profile photo, employee name, phone, designation, join date and status.
- Salary amount, salary paid/unpaid, employee due, challan paid/due and sale list total.
- Employee stock list and challan list with view/print option.
- Existing employee ledger, login management and activity log retained.
- Date range filters for report rows and PDF/Excel report downloads.
- Employee with linked ledger/transaction records is changed to Inactive rather than permanently deleted.

## Current data behavior
- Uses existing Local Storage keys (`shopflow.employees.v1`, `shopflow.employeeLedger.v1`, `shopflow.inventoryMovements.v1`, `shopflow.commerceInvoices.v1`, and `shopflow.products.v1`).
- Challan/stock/sale information is read from the current Commerce module records. Full cross-module accounting/API integration remains deferred as requested.
- Profile picture upload limit is 1 MB to reduce browser Local Storage quota issues.

## Run
From `frontend/` run `npm install` and `npm run dev`.

Build verification in this environment was blocked because the archived Windows `node_modules` did not contain Rollup's Linux optional native package. `People.jsx` passed JSX parsing and the XLSX/PDF dependencies were import-checked, but a complete Vite production build could not be confirmed here.
