# Purchase, Stock, Sale, Installment Sale & Employee Challan

## Included workflow
- Purchase: select a vendor, add one or more products, save a purchase voucher, and increase Main Stock.
- Sale: select a customer. Direct sale reduces Main Stock. If a salesperson/employee is selected, the sale is deducted from that employee's issued stock.
- Installment Sale: separate Sale submenu and invoice type; reduces Main Stock and records total, initial paid amount, and due.
- Challan: select an employee and issue products. Main Stock decreases and the employee's allocated stock increases. An employee ledger entry is also created.
- Stock: displays Main Stock, net Employee Stock, and stock movement history.
- Common printable voucher: Purchase, Sale, Installment Sale, and Challan all use the same printable voucher layout. Open a saved voucher and choose Print Voucher.
- Vendor purchase and payment entries are linked to the Vendor Ledger. Sale and paid amount are linked to the Customer Ledger.

## Important prototype limitation
This project currently uses browser Local Storage, not a shared backend database. Data is local to the browser/device and does not automatically synchronize across computers. Before production use, connect the modules to the Flask/API/database backend and add user authentication/permissions and server-side stock locking.

## Run
From `frontend`:
```bash
npm install
npm run dev
```
