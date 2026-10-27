# Employee Login and Ledger (prototype)

- Creating an employee requires a unique phone number.
- User ID is automatically set to the employee phone number.
- New employee default password is `112233`.
- The Employee Profile includes a password reset option.
- Employee Ledger supports salary added (payable by the business), salary paid, product issued (receivable from employee), payment received from employee, and other payable/receivable entries.
- Each ledger entry records date, amount, reason/details, optional reference, and product/quantity when relevant.
- Employee profile shows total employee owes us, total we owe employee, net balance, ledger history, and activity log.
- This is currently a browser-local prototype using localStorage. Credentials are not secure and are not shared across devices. Before production, implement server-side authentication, hashed passwords, authorization, database persistence, and audit logs. The default password should be changed on first login.
