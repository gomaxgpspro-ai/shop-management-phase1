# Shop Management System — Phase 1

React + Vite frontend and Python Flask backend starter.

## Phase 1 includes
- Light theme with purple accent
- Collapsible desktop sidebar and mobile navigation drawer
- Login and Register UI (demo only; no authentication persistence)
- Dashboard UI with illustrative sample figures and recent transactions
- Separate routed page for every requested module
- Flask API health check
- No database relations or business logic yet

## Requirements
- Node.js 18+ (20+ recommended)
- Python 3.10+
- VS Code

## Run the frontend
Open a terminal in the project folder:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

## Run the Flask backend
Open a second terminal:

```bash
cd backend
python -m venv .venv
```

Activate the environment:

Windows PowerShell:
```powershell
.\.venv\Scripts\Activate.ps1
```

Windows Command Prompt:
```bat
.venv\Scripts\activate.bat
```

macOS/Linux:
```bash
source .venv/bin/activate
```

Install dependencies and start Flask:
```bash
pip install -r requirements.txt
python app.py
```

The API health check is available at `http://127.0.0.1:5000/api/health`.

## Notes
- Login currently navigates to Dashboard for UI demonstration only.
- Register currently navigates to Login for UI demonstration only.
- Dashboard numbers and transactions are static sample data, not real business records.
- The search box, notifications, export, dashboard quick actions and table pagination are visual UI elements only.
- No database is created or connected in Phase 1.
- Do not deploy with the default development secret key. Authentication, validation, permissions and production configuration must be implemented before real use.


## Accounts module (updated)
- Accounts Dashboard with Today / This Month / Custom Date Range filters.
- Account Head create/edit, Income Entry, Expense Entry, transaction list, due ledger, cash/bank transfer workspace.
- Monthly report with account-head breakdown and Excel (.xlsx), PDF (.pdf), and print actions.
- Accounts data is currently saved in the browser's localStorage for this prototype. It is not yet stored in the Flask database and does not automatically import Sale, Purchase, Expense, or Daily Rent Collection records because those modules remain placeholders.
- Install frontend dependencies with `npm install` before running; Excel/PDF export uses `xlsx`, `jspdf`, and `jspdf-autotable`.
