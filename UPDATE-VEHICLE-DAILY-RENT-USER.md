# Vehicle, Daily Rent, Employee Stock and User Menu Update

- Employee stock rows are grouped by product so repeat challans increase quantity/amount instead of duplicating the product line.
- Each grouped product has a challan dropdown listing challan number and date; selecting a challan opens the in-profile voucher modal.
- Driver-designated employee profile hides the stock section.
- Vehicle page supports add/edit/delete, auto IDs, daily rent, optional driver assignment and Active/Inactive.
- Daily Rent Collection supports date-wise generation for active vehicles, compact month calendar, Received action, summary totals and printable A5/A4 browser vouchers.
- Header's Admin User dropdown opens Profile View, Setting & Permissions and Sign Out.
- Brand heading was reduced in size.
- Data currently persists in browser localStorage; backend/API persistence and a complete employee login/pre-order-to-challan transaction pipeline are not implemented in this frontend-only update.

## V3 follow-up
- Vehicle page title/header height and typography are reduced.
- Vehicle summary cards now show Total Vehicles, Active Vehicles, Daily Rent Total and Assigned Drivers; vehicle list row spacing and text are larger for readability.
- Fixed driver assignment source: Vehicle and Daily Rent now read Employee records from `shopflow.employees.v1` (the actual Employee module storage key). Driver category/designation matching is case-insensitive.
- Driver Employee profile now hides stock/challan/sale sections and instead shows Daily Rent Collection History plus a right-side Driver Rent Ledger (Total Rent, Received, Due Balance).
