import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import PlaceholderPage from "./components/PlaceholderPage";
import Dashboard from "./pages/Dashboard";
import AccountsPage from "./pages/Accounts";
import ProductPage from "./pages/Product";
import PeoplePage from "./pages/People";
import CommercePage from "./pages/Commerce";
import { Login, Register } from "./pages/Auth";

const pages = [
  ["Accounts", "/accounts", "Review account workspace UI. Account transactions will be added in a later phase."],
  ["Due Payment Ledger", "/due-payment-ledger", "A dedicated workspace for future due-payment ledger features."],
  ["Product", "/product", "Product catalogue UI. Product creation and inventory rules will be implemented later."],



  ["Pre-Order", "/pre-order", "Pre-order workspace UI for future order tracking."],
  ["Expense", "/expense", "Expense workspace UI for future expense records and categories."],
  ["Customer", "/customer", "Customer directory UI. Customer records will be connected in a later phase."],
  ["Vendor", "/vendor", "Vendor directory UI for future supplier details and balances."],
  ["Employee", "/employee", "Employee workspace UI for future staff profiles and permissions."],
  ["Vehicle", "/vehicle", "Vehicle workspace UI for future vehicle records."],
  ["Daily Rent Collection", "/daily-rent-collection", "Daily rent collection workspace UI. Collection entries and totals are not connected yet."],
  ["Reports", "/reports", "Reporting workspace UI. Reports will use real data after modules are connected."],
  ["User Profile", "/profile", "Profile page UI. Profile updates are not saved in Phase 1."],
  ["Setting", "/setting", "System settings UI placeholder. Settings persistence will be added later."]
];

function NotFound() {
  return <div className="not-found"><strong>404</strong><h1>Page not found</h1><p>The page you’re looking for doesn’t exist.</p><a className="button button-primary" href="/dashboard">Back to dashboard</a></div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts/*" element={<AccountsPage startView="dashboard" />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/purchase" element={<CommercePage mode="purchase" />} />
        <Route path="/stock" element={<CommercePage mode="stock" />} />
        <Route path="/sale/*" element={<CommercePage mode="sale" />} />
        <Route path="/sale/installment" element={<CommercePage mode="sale" />} />
        <Route path="/challan" element={<CommercePage mode="challan" />} />
        <Route path="/customer" element={<PeoplePage type="customer" />} />
        <Route path="/vendor" element={<PeoplePage type="vendor" />} />
        <Route path="/employee" element={<PeoplePage type="employee" />} />
        <Route path="/reports" element={<AccountsPage startView="reports" />} />
        {pages.filter(([, path]) => !["/accounts", "/reports", "/product", "/customer", "/vendor", "/employee", "/purchase", "/stock", "/sale", "/challan"].includes(path)).map(([title, path, description]) => <Route key={path} path={path} element={<PlaceholderPage title={title} description={description} />} />)}
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
