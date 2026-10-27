import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowDownRight, ArrowUpRight, Boxes, CircleDollarSign, PackagePlus, Plus, RefreshCw, Save, Truck } from "lucide-react";
import PageHeader from "../components/PageHeader";

const today = () => new Date().toISOString().slice(0, 10);
const money = value => `৳ ${Number(value || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const api = async (path, options = {}) => {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`);
  return result;
};

const definitions = {
  dashboard: { title: "Dashboard" },
  products: { title: "Product", endpoint: "products", fields: [
    ["name", "Product name", "text", true], ["sku", "SKU (optional)", "text"], ["category", "Category", "text"],
    ["unit", "Unit", "text"], ["purchase_price", "Purchase price", "number", true], ["selling_price", "Selling price", "number", true], ["stock", "Opening stock", "number"],
    ["status", "Status", "select", true, ["Active", "Inactive"]]
  ] },
  customers: { title: "Customer", endpoint: "customers", fields: [
    ["name", "Customer name", "text", true], ["phone", "Phone", "text"], ["email", "Email", "email"], ["address", "Address", "text"], ["opening_due", "Opening due (৳)", "number"], ["status", "Status", "select", true, ["Active", "Inactive"]]
  ] },
  vendors: { title: "Vendor", endpoint: "vendors", fields: [
    ["name", "Vendor name", "text", true], ["phone", "Phone", "text"], ["email", "Email", "email"], ["address", "Address", "text"], ["opening_due", "Opening due (৳)", "number"], ["status", "Status", "select", true, ["Active", "Inactive"]]
  ] },
  employees: { title: "Employee", endpoint: "employees", fields: [
    ["name", "Employee name", "text", true], ["phone", "Phone / user ID", "text"], ["category", "Category", "text"], ["role", "Role", "text"], ["status", "Status", "select", true, ["Active", "Inactive"]]
  ] },
  vehicles: { title: "Vehicle", endpoint: "vehicles", fields: [
    ["name", "Vehicle name", "text", true], ["registration", "Registration number", "text", true], ["type", "Type", "text"], ["daily_rate", "Daily rate (৳)", "number"], ["status", "Status", "select", true, ["Active", "Inactive"]]
  ] },
  purchases: { title: "Purchase", endpoint: "purchases", kind: "document", party: "vendors", partyLabel: "Vendor", fields: [
    ["date", "Date", "date", true], ["party_id", "Vendor", "vendors", true], ["paid", "Paid now (৳)", "number"],
    ["payment_method", "Payment method", "select", true, ["Cash", "Bank", "Mobile Banking"]], ["note", "Notes", "text"]
  ] },
  sales: { title: "Sale", endpoint: "sales", kind: "document", party: "customers", partyLabel: "Customer", fields: [
    ["date", "Date", "date", true], ["party_id", "Customer", "customers", true], ["paid", "Paid now (৳)", "number"],
    ["payment_method", "Payment method", "select", true, ["Cash", "Bank", "Mobile Banking"]], ["note", "Notes", "text"]
  ] },
  preorders: { title: "Pre-Order", endpoint: "preorders", kind: "document", party: "customers", partyLabel: "Customer", fields: [
    ["date", "Date", "date", true], ["party_id", "Customer", "customers", true], ["paid", "Advance paid (৳)", "number"],
    ["payment_method", "Payment method", "select", true, ["Cash", "Bank", "Mobile Banking"]], ["note", "Notes", "text"]
  ] },
  expenses: { title: "Expense", endpoint: "expenses", fields: [
    ["date", "Date", "date", true], ["category", "Category", "text", true], ["description", "Description", "text", true],
    ["amount", "Amount (৳)", "number", true], ["payment_method", "Paid from", "select", true, ["Cash", "Bank", "Mobile Banking"]], ["reference", "Reference", "text"]
  ] },
  rents: { title: "Daily Rent Collection", endpoint: "rents", fields: [
    ["date", "Date", "date", true], ["vehicle_id", "Vehicle", "vehicles", true], ["employee_id", "Collected by", "employees"],
    ["customer_name", "Customer", "text"], ["amount", "Amount (৳)", "number", true],
    ["payment_method", "Received into", "select", true, ["Cash", "Bank", "Mobile Banking"]], ["note", "Details", "text"]
  ] },
  transactions: { title: "Accounts", endpoint: "transactions", fields: [
    ["date", "Date", "date", true], ["kind", "Entry type", "select", true, ["income", "expense", "payment", "transfer"]],
    ["description", "Description", "text", true], ["amount", "Amount (৳)", "number", true],
    ["payment_method", "Account", "select", true, ["Cash", "Bank", "Mobile Banking"]], ["reference", "Reference", "text"]
  ] },
  settings: { title: "Settings", endpoint: "settings", fields: [
    ["shop_name", "Shop name", "text", true], ["phone", "Phone", "text"], ["address", "Address", "text"], ["currency", "Currency", "text"]
  ] },
  accounts: { title: "Accounts", endpoint: "transactions", fields: [
    ["date", "Date", "date", true], ["kind", "Entry type", "select", true, ["income", "expense", "payment", "transfer"]],
    ["description", "Description", "text", true], ["amount", "Amount (৳)", "number", true],
    ["payment_method", "Account", "select", true, ["Cash", "Bank", "Mobile Banking"]], ["reference", "Reference", "text"]
  ] },
  stock: { title: "Stock" },
  "due-payment-ledger": { title: "Due Payment Ledger" },
  reports: { title: "Reports" },
  profile: { title: "User Profile", endpoint: "settings", fields: [
    ["shop_name", "Shop name", "text", true], ["phone", "Phone", "text"], ["address", "Address", "text"], ["currency", "Currency", "text"]
  ] },
};

function defaultForm(definition) {
  const form = {};
  for (const [key, , type, , options] of definition.fields || []) {
    form[key] = type === "date" ? today() : type === "select" ? options[0] : "";
  }
  return form;
}

function Table({ columns, rows }) {
  return <div className="table-wrap"><table className="data-table">
    <thead><tr>{columns.map(([label]) => <th key={label}>{label}</th>)}</tr></thead>
    <tbody>{rows.length ? rows.map((row, index) => <tr key={row.id || index}>
      {columns.map(([label, value]) => <td key={label}>{typeof value === "function" ? value(row) : row[value] ?? "—"}</td>)}
    </tr>) : <tr><td colSpan={columns.length}>No records found.</td></tr>}</tbody>
  </table></div>;
}

export default function OperationsPage({ module }) {
  const definition = definitions[module] || definitions.dashboard;
  const [data, setData] = useState(null);
  const [form, setForm] = useState(() => defaultForm(definition));
  const [items, setItems] = useState([{ product_id: "", quantity: "1", price: "" }]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [paying, setPaying] = useState(null);
  const [payment, setPayment] = useState({ amount: "", payment_method: "Cash" });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setError("");
    try { setData(await api("/data")); }
    catch (requestError) { setError(requestError.message); }
  }

  useEffect(() => { refresh(); }, []);
  useEffect(() => { setForm(defaultForm(definition)); setItems([{ product_id: "", quantity: "1", price: "" }]); setEditing(null); setShowForm(false); }, [module]);
  useEffect(() => {
    if (data && (module === "settings" || module === "profile")) {
      setForm(current => ({ ...current, ...data.settings }));
    }
  }, [data, module]);

  const endpoint = definition.endpoint;
  const isDocument = definition.kind === "document";
  const sourceRows = useMemo(() => {
    if (!data) return [];
    if (module === "dashboard") return [];
    if (module === "stock") return data.products;
    if (module === "due-payment-ledger") return [...data.customers, ...data.vendors];
    if (module === "reports") return [...data.documents, ...data.expenses, ...data.rents];
    if (module === "accounts") return data.transactions;
    if (module === "transactions") return data.transactions;
    if (module === "profile") return [data.settings];
    if (module === "settings") return [data.settings];
    if (module === "purchases") return data.documents.filter(row => row.kind === "purchase");
    if (module === "sales") return data.documents.filter(row => row.kind === "sale");
    if (module === "preorders") return data.documents.filter(row => row.kind === "preorder");
    return data[endpoint] || [];
  }, [data, module, endpoint]);
  const filtered = sourceRows.filter(row => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const payload = isDocument ? { ...form, items } : form;
    try {
      await api(`/records/${endpoint}${editing ? `/${editing.id}` : ""}`, { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) });
      setForm(defaultForm(definition));
      setItems([{ product_id: "", quantity: "1", price: "" }]);
      setEditing(null);
      setShowForm(false);
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(row) {
    setEditing(row);
    setForm({ ...defaultForm(definition), ...row });
    setError("");
    setShowForm(true);
  }

  async function submitPayment(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/documents/${paying.id}/payments`, { method: "POST", body: JSON.stringify(payment) });
      setPaying(null);
      setPayment({ amount: "", payment_method: "Cash" });
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function convertPreorder(row) {
    if (!window.confirm(`Convert ${row.number} to a sale and deduct its items from stock?`)) return;
    setError("");
    try {
      await api(`/documents/${row.id}/convert`, { method: "POST", body: "{}" });
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function columns() {
    if (module === "products" || module === "stock") return [
      ["Product", "name"], ["SKU", "sku"], ["Category", "category"], ["Unit", "unit"],
      ["Purchase price", row => money(row.purchase_price)], ["Selling price", row => money(row.selling_price)],
      ["Available stock", row => `${row.stock} ${row.unit}`], ...(module === "products" ? [["Status", "status"], ["Action", row => <button className="button button-secondary small-button" onClick={() => startEdit(row)}>Edit</button>]] : [])
    ];
    if (module === "customers" || module === "vendors" || module === "due-payment-ledger") return [
      ["Type", row => row.kind || (data.customers.some(p => p.id === row.id) ? "customer" : "vendor")],
      ["Name", "name"], ["Phone", "phone"], ["Address", "address"], ["Balance", row => money(row.balance ?? row.opening_due)],
      ...(module === "due-payment-ledger" ? [] : [["Status", "status"], ["Action", row => <button className="button button-secondary small-button" onClick={() => startEdit(row)}>Edit</button>]])
    ];
    if (module === "employees") return [["Name", "name"], ["Phone / User ID", "phone"], ["Category", "category"], ["Role", "role"], ["Status", "status"], ["Action", row => <button className="button button-secondary small-button" onClick={() => startEdit(row)}>Edit</button>]];
    if (module === "vehicles") return [["Vehicle", "name"], ["Registration", "registration"], ["Type", "type"], ["Daily rate", row => money(row.daily_rate)], ["Status", "status"], ["Action", row => <button className="button button-secondary small-button" onClick={() => startEdit(row)}>Edit</button>]];
    if (["purchases", "sales", "preorders"].includes(module)) return [
      ["Invoice", "number"], ["Date", "date"], [definition.partyLabel, "party_name"],
      ["Items", row => (row.items || []).map(item => `${item.product_name} × ${item.quantity}`).join(", ")],
      ["Total", row => money(row.total)],
      ...(module === "preorders" ? [
        ["Advance", row => money(row.paid)], ["Order balance", row => money(row.total - row.paid)],
        ["Action", row => <button className="button button-secondary small-button" onClick={() => convertPreorder(row)}>Convert to sale</button>]
      ] : [
        ["Paid", row => money(row.paid)], ["Due", row => money(row.total - row.paid)],
        ["Action", row => row.total > row.paid
          ? <button className="button button-secondary small-button" onClick={() => { setPaying(row); setPayment({ amount: "", payment_method: "Cash" }); }}>Receive payment</button>
          : "Paid"]
      ])
    ];
    if (module === "expenses") return [["Date", "date"], ["Category", "category"], ["Description", "description"], ["Amount", row => money(row.amount)], ["Paid from", "payment_method"], ["Reference", "reference"]];
    if (module === "rents") return [["Date", "date"], ["Vehicle", "vehicle_name"], ["Collected by", "employee_name"], ["Customer", "customer_name"], ["Amount", row => money(row.amount)], ["Received into", "payment_method"]];
    if (module === "reports") return [["Date", "date"], ["Type", row => row.kind || row.category || "Rent"], ["Reference", row => row.number || row.reference || "—"], ["Party / Description", row => row.party_name || row.description || row.customer_name || "—"], ["Total", row => money(row.total ?? row.amount)], ["Paid", row => money(row.paid ?? row.amount)]];
    return [["Date", "date"], ["Type", "kind"], ["Description", "description"], ["Amount", row => money(row.amount)], ["Account", "payment_method"], ["Reference", "reference"]];
  }

  const isDashboard = module === "dashboard";
  const isReport = module === "reports";
  const isSettings = module === "settings" || module === "profile";
  const canCreate = Boolean(definition.endpoint) && !["stock", "due-payment-ledger", "reports", "profile"].includes(module);
  const formDefinition = module === "profile" ? definitions.settings : definition;
  const summary = data?.summary;

  return <>
    <PageHeader eyebrow="SHOP MANAGEMENT" title={definition.title} description={isDashboard ? "Live overview from connected products, invoices, accounts, expenses and vehicle collections." : `Manage ${definition.title.toLowerCase()} records and linked shop activity.`}
      actions={<><button className="button button-secondary" onClick={refresh}><RefreshCw size={15}/> Refresh</button>{canCreate && <button className="button button-primary" onClick={() => { setEditing(null); setForm(defaultForm(definition)); setError(""); setShowForm(true); }}><Plus size={16}/> Add {definition.title}</button>}</>} />
    {error && <div className="ops-error" role="alert"><AlertCircle size={17}/>{error}</div>}
    {!data ? <section className="panel"><p>Loading shop data…</p></section> : <>
      {(isDashboard || isReport) && <section className="ops-summary-grid">
        {[
          ["Sales", summary.sales, CircleDollarSign], ["Purchases", summary.purchases, Truck],
          ["Items in stock", summary.stock, Boxes], ["Customer due", summary.receivables, ArrowDownRight],
          ["Vendor payable", summary.payables, ArrowUpRight], ["Expenses", summary.expenses, CircleDollarSign],
          ["Vehicle rent", summary.rent, Truck]
        ].map(([label, value, Icon]) => <article className="stat-card" key={label}><div className="stat-top"><span className="stat-icon purple"><Icon size={19}/></span></div><div className="stat-label">{label}</div><div className="stat-value">{label === "Items in stock" ? value : money(value)}</div></article>)}
      </section>}
      {isDashboard && <section className="panel ops-links"><h2>Connected workflows</h2><div><Link to="/purchases">Receive stock from a purchase</Link><Link to="/sale">Sell available stock</Link><Link to="/expense">Record an expense</Link><Link to="/daily-rent-collection">Record vehicle rent</Link><Link to="/reports">View reports</Link></div><h2>Recent invoices</h2><Table columns={columnsForDocuments()} rows={data.documents.slice(0, 6)}/></section>}
      {!isDashboard && <>
        {!isSettings && <label className="ops-search">Search records <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by name, date, reference…"/></label>}
        {isSettings ? <form className="panel ops-form" onSubmit={submit}>
          <h2>{module === "profile" ? "Shop profile" : "Shop settings"}</h2>
          <div className="ops-form-grid">{(formDefinition.fields || []).map(field => renderField(field, form[field[0]], value => setForm(old => ({ ...old, [field[0]]: value })), data))}</div>
          <button className="button button-primary" disabled={busy}><Save size={15}/> Save settings</button>
        </form> : <section className="panel"><Table columns={columns()} rows={filtered}/></section>}
      </>}
    </>}
    {showForm && <div className="product-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowForm(false); }}>
      <section className="product-modal" role="dialog" aria-modal="true">
        <header className="product-modal-header"><div><span className="eyebrow">SHOP WORKSPACE</span><h2>{editing ? `Edit ${definition.title}` : `Add ${definition.title}`}</h2></div><button className="product-modal-close" onClick={() => { setShowForm(false); setEditing(null); }}>×</button></header>
        <form className="product-form" onSubmit={submit}>
          <div className="ops-form-grid">{(formDefinition.fields || []).filter(field => !editing || field[0] !== "stock").map(field => renderField(field, form[field[0]], value => setForm(old => ({ ...old, [field[0]]: value })), data))}</div>
          {isDocument && <div className="ops-line-items"><h3>Invoice items</h3>{items.map((line, index) => <div className="ops-line" key={index}>
            <select required aria-label="Product" value={line.product_id} onChange={event => {
              const product = data.products.find(row => row.id === event.target.value);
              setItems(rows => rows.map((item, i) => i === index ? { ...item, product_id: event.target.value, price: String(module === "purchases" ? product?.purchase_price || 0 : product?.selling_price || 0) } : item));
            }}><option value="">Select product</option>{data.products.filter(product => product.status === "Active").map(product => <option key={product.id} value={product.id}>{product.name} ({product.stock} {product.unit} in stock)</option>)}</select>
            <input aria-label="Quantity" type="number" min="0.01" step="0.01" required value={line.quantity} onChange={event => setItems(rows => rows.map((item, i) => i === index ? { ...item, quantity: event.target.value } : item))}/>
            <input aria-label="Unit price" type="number" min="0" step="0.01" required value={line.price} onChange={event => setItems(rows => rows.map((item, i) => i === index ? { ...item, price: event.target.value } : item))}/>
            <button type="button" className="button button-secondary" onClick={() => setItems(rows => rows.length > 1 ? rows.filter((_, i) => i !== index) : rows)}>Remove</button>
          </div>)}<button type="button" className="button button-secondary" onClick={() => setItems(rows => [...rows, { product_id: "", quantity: "1", price: "" }])}><PackagePlus size={15}/> Add item</button></div>}
          {error && <p className="product-form-error">{error}</p>}
          <div className="product-form-footer"><button type="button" className="button button-secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button><button className="button button-primary" disabled={busy}><Save size={15}/> {busy ? "Saving…" : editing ? "Save changes" : "Save record"}</button></div>
        </form>
      </section>
    </div>}
    {paying && <div className="product-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setPaying(null); }}>
      <section className="product-modal" role="dialog" aria-modal="true">
        <header className="product-modal-header"><div><span className="eyebrow">{paying.number}</span><h2>Record payment</h2></div><button className="product-modal-close" onClick={() => setPaying(null)}>×</button></header>
        <form className="product-form" onSubmit={submitPayment}><p>Outstanding balance: <strong>{money(paying.total - paying.paid)}</strong></p>
          <div className="ops-form-grid"><label>Payment amount (৳)<input type="number" min="0.01" max={paying.total - paying.paid} step="0.01" required value={payment.amount} onChange={event => setPayment(old => ({ ...old, amount: event.target.value }))}/></label>
            <label>Received / paid into<select value={payment.payment_method} onChange={event => setPayment(old => ({ ...old, payment_method: event.target.value }))}><option>Cash</option><option>Bank</option><option>Mobile Banking</option></select></label></div>
          {error && <p className="product-form-error">{error}</p>}
          <div className="product-form-footer"><button type="button" className="button button-secondary" onClick={() => setPaying(null)}>Cancel</button><button className="button button-primary" disabled={busy}><Save size={15}/> Record payment</button></div>
        </form>
      </section>
    </div>}
  </>;
}

function columnsForDocuments() {
  return [["Invoice", "number"], ["Type", row => row.kind], ["Date", "date"], ["Party", "party_name"], ["Total", row => money(row.total)], ["Paid / advance", row => money(row.paid)], ["Due / order balance", row => money(row.total - row.paid)]];
}

function renderField([key, label, type, required, options], value, onChange, data) {
  const rows = ["vehicles", "employees", "vendors", "customers"].includes(type) ? data[type].filter(row => row.status === "Active") : [];
  if (["vehicles", "employees", "vendors", "customers"].includes(type)) return <label key={key}>{label}<select required={required} value={value || ""} onChange={event => onChange(event.target.value)}><option value="">Select {label.toLowerCase()}</option>{rows.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>;
  if (type === "select") return <label key={key}>{label}<select required={required} value={value || options[0]} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option} value={option}>{option}</option>)}</select></label>;
  return <label key={key}>{label}<input type={type} required={required} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} value={value ?? ""} onChange={event => onChange(event.target.value)} /></label>;
}
