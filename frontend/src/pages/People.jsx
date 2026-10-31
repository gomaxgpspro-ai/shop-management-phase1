import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Eye, X, Users, UserRound, Truck, CheckCircle2, CircleOff, Activity, KeyRound, Wallet, BookOpen, Package, RotateCcw, CalendarDays, Download, FileSpreadsheet, FileText, ImagePlus } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const EMPLOYEE_CATEGORIES = ["Driver", "SR", "Sales Executive", "Manager", "Accountant", "Technician", "Office Staff", "Store Keeper", "Delivery Staff", "Security Guard", "Cleaner", "Helper", "Other"];
const ROLES = ["Admin", "User", "Manager"];
const EMPTY = { name: "", phone: "", email: "", address: "", category: "Driver", role: "User", status: "Active", company: "", openingDue: "0", notes: "", designation: "", joinDate: new Date().toISOString().slice(0,10), salaryAmount: "0", photo: "" };
const LEDGER_TYPES = [
  { value: "salary_added", label: "Salary Added — We Owe Employee", side: "payable", sign: 1 },
  { value: "salary_paid", label: "Salary Paid to Employee", side: "payable", sign: -1 },
  { value: "product_issued", label: "Product Issued — Employee Owes Us", side: "receivable", sign: 1 },
  { value: "employee_payment", label: "Payment Received from Employee", side: "receivable", sign: -1 },
  { value: "other_payable", label: "Other Due — We Owe Employee", side: "payable", sign: 1 },
  { value: "other_receivable", label: "Other Due — Employee Owes Us", side: "receivable", sign: 1 },
];
const CONFIG = {
  customer: { title: "Customer", singular: "Customer", icon: Users, key: "shopflow.customers.v1", fields: ["name", "phone", "email", "address", "openingDue", "notes"] },
  vendor: { title: "Vendor", singular: "Vendor", icon: Truck, key: "shopflow.vendors.v1", fields: ["name", "company", "phone", "email", "address", "openingDue", "notes"] },
  employee: { title: "Employee", singular: "Employee", icon: UserRound, key: "shopflow.employees.v1", fields: ["name", "category", "role", "phone", "email", "address", "status", "notes"] },
};
function load(key) { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } }
function saveLocal(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
function loadLogs() { return load("shopflow.activityLog.v1"); }
function dateLabel(value) { if (!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? value : d.toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" }); }
function dateOnly(value) { return value ? new Date(value).toLocaleDateString("en-GB") : "—"; }
function makeId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
const money = (v) => `৳ ${Number(v || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PeoplePage({ type = "customer" }) {
  const cfg = CONFIG[type] || CONFIG.customer;
  const isEmployee = type === "employee";
  const Icon = cfg.icon;
  const [items, setItems] = useState(() => load(cfg.key));
  const [logs, setLogs] = useState(loadLogs);
  const [ledger, setLedger] = useState(() => load("shopflow.employeeLedger.v1"));
  const [partyLedger, setPartyLedger] = useState(() => load("shopflow.partyLedger.v1"));
  const [partyLedgerModal, setPartyLedgerModal] = useState(false);
  const [partyLedgerError, setPartyLedgerError] = useState("");
  const [partyLedgerForm, setPartyLedgerForm] = useState({ type: "customer_sale", date: new Date().toISOString().slice(0, 10), amount: "", product: "", quantity: "1", reason: "", reference: "" });
  const [credentials, setCredentials] = useState(() => load("shopflow.employeeCredentials.v1"));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [salaryFilter, setSalaryFilter] = useState("All");
  const [reportStart, setReportStart] = useState("");
  const [reportEnd, setReportEnd] = useState("");
  const [modal, setModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedEmployeeChallan, setSelectedEmployeeChallan] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState("");
  const [ledgerModal, setLedgerModal] = useState(false);
  const [ledgerForm, setLedgerForm] = useState({ type: "salary_added", date: new Date().toISOString().slice(0, 10), amount: "", product: "", quantity: "1", reason: "", reference: "" });
  const [ledgerError, setLedgerError] = useState("");
  const [resetModal, setResetModal] = useState(false);
  const [resetForm, setResetForm] = useState({ password: "112233", confirm: "112233" });
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => { setItems(load(cfg.key)); setQuery(""); setStatusFilter("All"); setModal(false); setProfile(null); setEditing(null); }, [cfg.key]);
  useEffect(() => saveLocal(cfg.key, items), [items, cfg.key]);
  useEffect(() => saveLocal("shopflow.activityLog.v1", logs.slice(0, 1000)), [logs]);
  useEffect(() => saveLocal("shopflow.employeeLedger.v1", ledger), [ledger]);
  useEffect(() => saveLocal("shopflow.partyLedger.v1", partyLedger), [partyLedger]);
  useEffect(() => saveLocal("shopflow.employeeCredentials.v1", credentials), [credentials]);

  const filtered = useMemo(() => items.filter((item) => {
    const haystack = [item.name, item.phone, item.email, item.company, item.category, item.role, item.userId].join(" ").toLowerCase();
    const salaryPaid = ledger.filter(e => e.employeeId === item.id && e.type === "salary_paid").reduce((sum,e)=>sum+Number(e.amount||0),0);
    const salaryDue = Math.max(0, Number(item.salaryAmount || 0) - salaryPaid);
    return (!query || haystack.includes(query.toLowerCase())) && (statusFilter === "All" || item.status === statusFilter) && (!isEmployee || salaryFilter === "All" || (salaryDue <= 0 ? "Paid" : "Unpaid") === salaryFilter);
  }), [items, query, statusFilter, salaryFilter, ledger, isEmployee]);
  const activeCount = items.filter(x => x.status === "Active").length;
  function logAction(action, item, extra = "", module = cfg.title) {
    const currentUser = localStorage.getItem("shopflow.currentUser") || "Admin";
    setLogs(prev => [{ id: makeId(), date: new Date().toISOString(), user: currentUser, module, action, record: item.name, recordId: item.id, details: extra || `${cfg.singular}: ${item.name}` }, ...prev].slice(0, 1000));
  }
  function openAdd() { setEditing(null); setForm({ ...EMPTY, category: isEmployee ? "Driver" : "", role: "User" }); setError(""); setModal(true); }
  function openEdit(item) { setEditing(item.id); setForm({ ...EMPTY, ...item, openingDue: String(item.openingDue ?? "0") }); setError(""); setModal(true); }
  function save(event) {
    event.preventDefault();
    if (!form.name.trim()) { setError(`${cfg.singular} name is required.`); return; }
    if (isEmployee && !form.phone.trim()) { setError("Employee phone number is required because it will be used as the User ID."); return; }
    if (form.phone.trim() && !/^[+\d()\-\s]{6,20}$/.test(form.phone.trim())) { setError("Enter a valid phone number."); return; }
    const phone = form.phone.trim();
    if (isEmployee && items.some(x => x.phone?.trim() === phone && x.id !== editing)) { setError("This phone number is already assigned to another employee. Each employee needs a unique User ID."); return; }
    const now = new Date().toISOString();
    const oldItem = editing ? items.find(x => x.id === editing) : null;
    const record = { ...form, id: editing || makeId(), name: form.name.trim(), phone, email: form.email.trim(), userId: isEmployee ? phone : undefined, createdAt: oldItem?.createdAt || now, updatedAt: now, status: form.status || "Active" };
    setItems(prev => editing ? prev.map(x => x.id === editing ? record : x) : [...prev, record]);
    if (isEmployee) {
      if (!editing) {
        setCredentials(prev => [...prev, { employeeId: record.id, userId: phone, password: "112233", createdAt: now, passwordChangedAt: null }]);
        logAction("Login created", record, `Employee login created. User ID: ${phone}; default password: 112233`, "User Management");
      } else {
        setCredentials(prev => prev.map(c => c.employeeId === record.id ? { ...c, userId: phone } : c));
      }
    }
    logAction(editing ? "Updated" : "Created", record, `${editing ? "Updated" : "Created"} ${cfg.singular.toLowerCase()} record${isEmployee ? `; User ID: ${phone}` : ""}`);
    setModal(false); setEditing(null); setForm({ ...EMPTY });
  }
  function toggle(item) { const updated = { ...item, status: item.status === "Active" ? "Inactive" : "Active", updatedAt: new Date().toISOString() }; setItems(prev => prev.map(x => x.id === item.id ? updated : x)); logAction("Status changed", updated, `Status changed to ${updated.status}`); if (profile?.id === item.id) setProfile(updated); }
  function remove(item) {
    if (isEmployee) {
      const hasHistory = ledger.some(e => e.employeeId === item.id) || load("shopflow.commerceInvoices.v1").some(d => d.employeeId === item.id || d.kind === "challan" && d.employeeId === item.id) || load("shopflow.inventoryMovements.v1").some(m => m.employeeId === item.id);
      if (hasHistory) {
        const choice = window.confirm(`“${item.name}”-এর সঙ্গে ledger বা transaction যুক্ত আছে। Permanent delete করলে হিসাবের history নষ্ট হতে পারে। Cancel চাপলে record থাকবে; OK চাপলে employee-কে Inactive করা হবে।`);
        if (choice) { const updated={...item,status:"Inactive",updatedAt:new Date().toISOString()}; setItems(prev=>prev.map(x=>x.id===item.id?updated:x)); if(profile?.id===item.id)setProfile(updated); logAction("Status changed",updated,"Has linked transactions; changed to Inactive instead of permanent deletion"); }
        return;
      }
    }
    if (!window.confirm(`Delete ${cfg.singular.toLowerCase()} “${item.name}”?${isEmployee ? " This employee has no linked transactions." : ""}`)) return;
    setItems(prev => prev.filter(x => x.id !== item.id)); logAction("Deleted", item, `Deleted ${cfg.singular.toLowerCase()} record`);
    if (isEmployee) setCredentials(prev => prev.filter(c => c.employeeId !== item.id));
    if (profile?.id === item.id) setProfile(null);
  }
  const relatedLogs = (item) => logs.filter(l => l.recordId === item.id || l.record === item.name || l.details?.includes(item.name)).sort((a,b) => new Date(b.date)-new Date(a.date));
  const employeeLedger = (item) => ledger.filter(entry => entry.employeeId === item.id).sort((a,b) => new Date(b.date)-new Date(a.date) || new Date(b.createdAt)-new Date(a.createdAt));
  function getBalance(item) {
    const entries = ledger.filter(x => x.employeeId === item.id);
    let receivable = 0, payable = 0;
    entries.forEach(e => {
      const t = LEDGER_TYPES.find(x => x.value === e.type);
      if (!t) return;
      if (t.side === "receivable") receivable += Number(e.amount || 0) * t.sign;
      else payable += Number(e.amount || 0) * t.sign;
    });
    return { receivable, payable, net: receivable - payable };
  }
  const PARTY_TYPES = type === "vendor" ? [
    { value: "vendor_purchase", label: "Goods / Product Received from Vendor", sign: 1 },
    { value: "vendor_payment", label: "Payment Made to Vendor", sign: -1 },
    { value: "vendor_advance", label: "Advance Paid to Vendor", sign: -1 },
    { value: "vendor_refund", label: "Refund Received from Vendor", sign: -1 },
  ] : [
    { value: "customer_sale", label: "Product Given / Sale to Customer", sign: 1 },
    { value: "customer_payment", label: "Payment Received from Customer", sign: -1 },
    { value: "customer_advance", label: "Customer Advance Received", sign: -1 },
    { value: "customer_refund", label: "Refund / Credit Returned to Customer", sign: 1 },
  ];
  const partyEntries = (item) => partyLedger.filter(entry => entry.partyType === type && entry.partyId === item.id).sort((a,b) => new Date(b.date)-new Date(a.date) || new Date(b.createdAt)-new Date(a.createdAt));
  function partyEntriesWithBalance(item) {
    const chronological = partyLedger.filter(entry => entry.partyType === type && entry.partyId === item.id).sort((a,b) => new Date(a.date)-new Date(b.date) || new Date(a.createdAt)-new Date(b.createdAt));
    let running = Number(item.openingDue || 0);
    const rows = chronological.map(entry => { running += Number(entry.amount || 0) * Number(entry.sign || 1); return { ...entry, runningBalance: running }; });
    return rows.reverse();
  }
  function getPartyBalance(item) {
    const opening = Number(item.openingDue || 0);
    return opening + partyLedger.filter(e => e.partyType === type && e.partyId === item.id).reduce((sum, e) => sum + Number(e.amount || 0) * Number(e.sign || 1), 0);
  }
  function openPartyLedger() {
    setPartyLedgerForm({ type: type === "vendor" ? "vendor_purchase" : "customer_sale", date: new Date().toISOString().slice(0, 10), amount: "", product: "", quantity: "1", reason: "", reference: "" });
    setPartyLedgerError(""); setPartyLedgerModal(true);
  }
  function savePartyLedger(event) {
    event.preventDefault();
    if (!profile) return;
    const amount = Number(partyLedgerForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) { setPartyLedgerError("Enter an amount greater than zero."); return; }
    if (!partyLedgerForm.reason.trim()) { setPartyLedgerError("Please add a reason/details for this transaction."); return; }
    const def = PARTY_TYPES.find(x => x.value === partyLedgerForm.type);
    const entry = { id: makeId(), partyType: type, partyId: profile.id, partyName: profile.name, type: partyLedgerForm.type, typeLabel: def?.label || partyLedgerForm.type, sign: def?.sign ?? 1, date: partyLedgerForm.date || new Date().toISOString().slice(0,10), amount, product: partyLedgerForm.product.trim(), quantity: Number(partyLedgerForm.quantity || 1), reason: partyLedgerForm.reason.trim(), reference: partyLedgerForm.reference.trim(), createdAt: new Date().toISOString(), createdBy: localStorage.getItem("shopflow.currentUser") || "Admin" };
    setPartyLedger(prev => [entry, ...prev]);
    setLogs(prev => [{ id: makeId(), date: new Date().toISOString(), user: localStorage.getItem("shopflow.currentUser") || "Admin", module: `${cfg.title} Ledger`, action: "Transaction added", record: profile.name, recordId: profile.id, details: `${entry.typeLabel}; ${entry.reason}; ${money(amount)}` }, ...prev].slice(0,1000));
    setPartyLedgerModal(false);
  }
  function openLedger() { setLedgerForm({ type: "salary_added", date: new Date().toISOString().slice(0, 10), amount: "", product: "", quantity: "1", reason: "", reference: "" }); setLedgerError(""); setLedgerModal(true); }
  function saveLedger(event) {
    event.preventDefault();
    if (!profile) return;
    const amount = Number(ledgerForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) { setLedgerError("Enter an amount greater than zero."); return; }
    const typeDef = LEDGER_TYPES.find(x => x.value === ledgerForm.type);
    if (!ledgerForm.reason.trim()) { setLedgerError("Please enter the reason/details for this transaction."); return; }
    if (ledgerForm.type === "product_issued" && !ledgerForm.product.trim()) { setLedgerError("Enter the product name issued to the employee."); return; }
    const entry = { id: makeId(), employeeId: profile.id, employeeName: profile.name, type: ledgerForm.type, typeLabel: typeDef?.label || ledgerForm.type, date: ledgerForm.date || new Date().toISOString().slice(0, 10), amount, product: ledgerForm.product.trim(), quantity: Number(ledgerForm.quantity || 1), reason: ledgerForm.reason.trim(), reference: ledgerForm.reference.trim(), createdAt: new Date().toISOString(), createdBy: localStorage.getItem("shopflow.currentUser") || "Admin" };
    setLedger(prev => [entry, ...prev]);
    logAction("Ledger entry added", profile, `${entry.typeLabel}; ${entry.reason}; Amount ${money(amount)}`, "Employee Ledger");
    setLedgerModal(false);
  }
  function openReset() { setResetForm({ password: "112233", confirm: "112233" }); setResetMessage(""); setResetModal(true); }
  function resetPassword(event) {
    event.preventDefault();
    if (resetForm.password.length < 6) { setResetMessage("Password must be at least 6 characters."); return; }
    if (resetForm.password !== resetForm.confirm) { setResetMessage("Passwords do not match."); return; }
    const current = credentials.find(c => c.employeeId === profile?.id);
    if (!current) { setCredentials(prev => [...prev, { employeeId: profile.id, userId: profile.phone, password: resetForm.password, createdAt: new Date().toISOString(), passwordChangedAt: new Date().toISOString() }]); }
    else setCredentials(prev => prev.map(c => c.employeeId === profile.id ? { ...c, userId: profile.phone || c.userId, password: resetForm.password, passwordChangedAt: new Date().toISOString() } : c));
    const updatedProfile = { ...profile, userId: profile.phone };
    setProfile(updatedProfile);
    logAction("Password reset", updatedProfile, `Employee password reset by ${localStorage.getItem("shopflow.currentUser") || "Admin"}`, "User Management");
    setResetModal(false); setResetMessage("");
  }
  const profileCredential = profile && credentials.find(c => c.employeeId === profile.id);
  const reportInRange = rows => rows.filter(r => { const d=String(r.date||r.createdAt||"").slice(0,10); return (!reportStart || d >= reportStart) && (!reportEnd || d <= reportEnd); });
  const balance = profile ? getBalance(profile) : { receivable: 0, payable: 0, net: 0 };
  const salaryEntries = profile ? employeeLedger(profile).filter(e => ["salary_added","salary_paid"].includes(e.type)) : [];
  const salaryPaid = profile ? reportInRange(employeeLedger(profile)).filter(e => e.type === "salary_paid").reduce((sum,e)=>sum+Number(e.amount||0),0) : 0;
  const salaryAmount = Number(profile?.salaryAmount || 0);
  const salaryDue = Math.max(0, salaryAmount - salaryPaid);
  const profileInvoices = profile ? load("shopflow.commerceInvoices.v1").filter(d => d.employeeId === profile.id || (d.kind === "challan" && d.partyId === profile.id)) : [];
  const challans = profileInvoices.filter(d => d.kind === "challan");
  const stockRowsRaw = profile ? load("shopflow.inventoryMovements.v1").filter(m => m.employeeId === profile.id && m.kind === "challan").map(m => { const doc=challans.find(d=>d.number===m.reference); const line=doc?.items?.find(it=>it.productId===m.productId); return { ...m, productName:line?.productName || load("shopflow.products.v1").find(x=>x.id===m.productId)?.name || "Product", amount:Number(line?.price||0), totalAmount:Number(line?.total ?? (Number(line?.price||0)*Number(m.quantity||0))), challanNumber:doc?.number || m.reference || "" , challanDate:doc?.date || m.date || "" }; }) : [];
  const stockRows = Object.values(stockRowsRaw.reduce((acc,row)=>{const key=row.productId; if(!acc[key]) acc[key]={...row, quantity:0,totalAmount:0, challanRefs:[]}; acc[key].quantity+=Number(row.quantity||0); acc[key].totalAmount+=Number(row.totalAmount||0); if(row.challanNumber&&!acc[key].challanRefs.some(c=>c.number===row.challanNumber)) acc[key].challanRefs.push({number:row.challanNumber,date:row.challanDate}); return acc;},{}));
  const sales = profileInvoices.filter(d => ["sale","installment"].includes(d.kind));
  const saleListTotal = reportInRange(sales).reduce((sum,d)=>sum+Number(d.total||0),0);
  const isDriverProfile = isEmployee && [profile?.category, profile?.designation, profile?.position, profile?.jobTitle].some(v => String(v||"").trim().toLowerCase()==="driver" || String(v||"").toLowerCase().includes("driver"));
  const driverRentEntries = profile ? reportInRange(load("shopflow.dailyRent.v1").filter(r => String(r.driverId) === String(profile.id) || (r.driverName && r.driverName === profile.name))).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))) : [];
  const driverRentReceived = driverRentEntries.reduce((sum,r)=>sum+Number((r.paidAmount??(r.status==="Received"?r.amount:0))||0),0);
  const driverRentDue = driverRentEntries.reduce((sum,r)=>sum+Math.max(0,Number(r.amount||0)-Number((r.paidAmount??(r.status==="Received"?r.amount:0))||0)),0);
  const driverRentTotal = driverRentEntries.reduce((sum,r)=>sum+Number(r.amount||0),0);
  function exportEmployeeList(format) {
    const rows=filtered.map((item,i)=>{const paid=ledger.filter(e=>e.employeeId===item.id&&e.type==="salary_paid").reduce((sum,e)=>sum+Number(e.amount||0),0);const due=Math.max(0,Number(item.salaryAmount||0)-paid);return {SL:i+1,Employee:item.name,Phone:item.phone||"",Designation:item.designation||item.category||"",SalaryAmount:Number(item.salaryAmount||0),PaidSalary:paid,UnpaidSalary:due,DueAmount:getBalance(item).receivable,SalaryStatus:due<=0?"Paid":"Unpaid",Status:item.status||"Active"}});
    const name="employee-list-report";
    if(format==="excel"){const ws=XLSX.utils.json_to_sheet(rows);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Employees");XLSX.writeFile(wb,`${name}.xlsx`);return;}
    const doc=new jsPDF({orientation:"landscape",unit:"pt",format:"a4"});doc.setFontSize(15);doc.text("Employee List Report",36,32);autoTable(doc,{startY:48,head:[["SL","Employee","Phone","Designation","Salary","Paid","Unpaid","Due","Salary Status","Status"]],body:rows.map(r=>[r.SL,r.Employee,r.Phone,r.Designation,r.SalaryAmount,r.PaidSalary,r.UnpaidSalary,r.DueAmount,r.SalaryStatus,r.Status]),styles:{fontSize:7,cellPadding:4},headStyles:{fillColor:[109,40,217]}});doc.save(`${name}.pdf`);
  }
  function exportEmployee(format) {
    if (!profile) return;
    const filteredLedger=reportInRange(employeeLedger(profile));
    const filteredStock=reportInRange(stockRows);
    const filteredChallans=reportInRange(challans);
    const rows=[
      {Section:"Employee Information",Field:"Employee Name",Value:profile.name||""},{Section:"Employee Information",Field:"Phone",Value:profile.phone||""},{Section:"Employee Information",Field:"Address",Value:profile.address||""},{Section:"Employee Information",Field:"Designation",Value:profile.designation||profile.category||""},{Section:"Employee Information",Field:"Join Date",Value:profile.joinDate||""},{Section:"Employee Information",Field:"Status",Value:profile.status||""},
      {Section:"Salary",Field:"Salary Amount",Value:salaryAmount},{Section:"Salary",Field:"Paid Salary",Value:salaryPaid},{Section:"Salary",Field:"Unpaid Salary",Value:salaryDue},{Section:"Accounts",Field:"Employee Due Amount",Value:balance.receivable},{Section:"Accounts",Field:"Challan Due Amount",Value:filteredChallans.reduce((sum,d)=>sum+Math.max(0,Number(d.total||0)-Number(d.paid||0)),0)},{Section:"Sales",Field:"Sale List Total",Value:saleListTotal},
      ...filteredStock.map(x=>({Section:"Employee Stock",Date:x.date,Product:x.productName,ChallanNo:x.reference,Quantity:x.quantity,Amount:x.amount,TotalAmount:x.totalAmount})),
      ...filteredChallans.map(x=>({Section:"Employee Challan",Date:x.date,ChallanNo:x.number,TotalAmount:x.total,PaidAmount:x.paid||0,DueAmount:Math.max(0,Number(x.total||0)-Number(x.paid||0))})),
      ...filteredLedger.map(x=>({Section:"Ledger / Payment History",Date:x.date,Transaction:x.typeLabel,Product:x.product||"",Quantity:x.quantity||"",Reference:x.reference||"",Amount:x.amount,Details:x.reason||""})),
      ...reportInRange(relatedLogs(profile)).map(x=>({Section:"Activity Log",Date:x.date,Module:x.module,Action:x.action,Details:x.details}))
    ];
    const filename=`employee-report-${(profile.name||"employee").replace(/[^a-z0-9-_]+/gi,"-").toLowerCase()}`;
    if (format === "excel") { const ws=XLSX.utils.json_to_sheet(rows); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Employee Report"); XLSX.writeFile(wb,`${filename}.xlsx`); return; }
    const doc=new jsPDF({orientation:"landscape",unit:"pt",format:"a4"});
    doc.setFontSize(16); doc.text("Employee Report",36,34); doc.setFontSize(9); doc.text(`${profile.name} | ${profile.phone||"—"} | Date range: ${reportStart||"All"} to ${reportEnd||"All"}`,36,51);
    autoTable(doc,{startY:65,head:[["Section","Date","Details","Reference","Qty","Amount","Total / Balance"]],body:rows.map(r=>[r.Section||"",r.Date||r.Value||"",r.Field||r.Product||r.Transaction||r.Action||r.Details||"",r.ChallanNo||r.Reference||r.Module||"",r.Quantity||"",r.Amount??"",r.TotalAmount??r.Value??""]),styles:{fontSize:7,cellPadding:4},headStyles:{fillColor:[109,40,217]}});
    doc.save(`${filename}.pdf`);
  }

  return <div className="people-page">
    <div className="people-header"><div className="people-title"><span className="people-title-icon"><Icon size={18}/></span><h1>{cfg.title}</h1></div><div className="people-stats"><div><small>Total {cfg.title}s</small><strong>{items.length}</strong></div><div><small>Active</small><strong>{activeCount}</strong></div><div><small>Inactive</small><strong>{items.length-activeCount}</strong></div></div><button className="button button-primary people-add" onClick={openAdd}><Plus size={15}/> Add New {cfg.singular}</button></div>
    <section className="people-panel"><div className="people-toolbar"><div><h2>{cfg.title} List</h2><p>{filtered.length} record{filtered.length===1?"":"s"} found</p></div><div className="people-controls"><label className="people-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={isEmployee?"Search employee name or phone...":`Search ${cfg.title.toLowerCase()}...`}/></label><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} aria-label="Filter by status"><option>All</option><option>Active</option><option>Inactive</option></select>{isEmployee&&<select value={salaryFilter} onChange={e=>setSalaryFilter(e.target.value)} aria-label="Filter by salary status"><option>All</option><option>Paid</option><option>Unpaid</option></select>}{isEmployee&&<button className="button button-secondary" onClick={()=>exportEmployeeList("excel")}><Download size={14}/> Download Report</button>}</div></div>
      <div className="people-table-wrap"><table className="data-table people-table"><thead>{isEmployee?<tr><th>SL</th><th>Employee</th><th>Phone</th><th>Due Amount</th><th>Salary Status</th><th>Status</th><th>Actions</th></tr>:<tr><th>SL</th><th>Name / Company</th><th>Phone</th><th>Current Balance</th><th>Status</th><th>Actions</th></tr>}</thead><tbody>{filtered.map((item,i)=>{const b=isEmployee?getBalance(item):null;const paid=ledger.filter(e=>e.employeeId===item.id&&e.type==="salary_paid").reduce((sum,e)=>sum+Number(e.amount||0),0);const salaryDue=Math.max(0,Number(item.salaryAmount||0)-paid);return <tr key={item.id}><td>{i+1}</td><td><div className="people-name">{item.photo?<img className="people-list-photo" src={item.photo} alt=""/>:<span>{(item.name||"?").slice(0,1).toUpperCase()}</span>}<div><strong>{item.name}</strong><small>{isEmployee?(item.designation||item.category||"Employee"):item.company}</small></div></div></td><td>{item.phone||"—"}</td>{isEmployee?<><td><strong>{money(b.receivable)}</strong></td><td><span className={`people-salary-pill ${salaryDue<=0?"paid":"unpaid"}`}>{salaryDue<=0?"Paid":"Unpaid"}</span><small className="people-salary-sub">Due {money(salaryDue)}</small></td></>:<td><div className="people-balance-cell"><strong className={getPartyBalance(item)>0?"balance-receivable":getPartyBalance(item)<0?"balance-payable":""}>{getPartyBalance(item)>0?money(getPartyBalance(item)):getPartyBalance(item)<0?`${money(Math.abs(getPartyBalance(item)))} credit`:money(0)}</strong><small>{type==="vendor"?(getPartyBalance(item)>0?"We owe vendor":"Vendor balance / advance"):(getPartyBalance(item)>0?"Customer due":"Customer credit / advance")}</small></div></td>}<td><button className={`people-status-toggle ${item.status==="Active"?"active":"inactive"}`} onClick={()=>toggle(item)}><span/>{item.status||"Active"}</button></td><td><div className="product-row-actions"><button title="View profile" aria-label={`View ${item.name}`} onClick={(event)=>{event.preventDefault();event.stopPropagation();setReportStart("");setReportEnd("");setProfile({...item})}} type="button"><Eye size={15}/></button><button title="Edit" aria-label={`Edit ${item.name}`} onClick={()=>openEdit(item)}><Pencil size={15}/></button><button className="product-delete-button" title="Delete" onClick={()=>remove(item)}><Trash2 size={15}/></button></div></td></tr>})}{filtered.length===0&&<tr><td colSpan={isEmployee?7:6}><div className="product-empty"><span><Icon size={22}/></span><strong>No {cfg.title.toLowerCase()} records found</strong><p>Add a new record or change your search.</p><button className="button button-primary" onClick={openAdd}><Plus size={15}/> Add New {cfg.singular}</button></div></td></tr>}</tbody></table></div>
    </section>
    {modal&&<div className="product-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><section className="product-modal" role="dialog" aria-modal="true"><header className="product-modal-header"><div><h2>{editing?`Edit ${cfg.singular}`:`Add New ${cfg.singular}`}</h2></div><button className="product-modal-close" onClick={()=>setModal(false)}><X size={18}/></button></header><form className="product-form" onSubmit={save}><div className="product-form-grid">
      <label>Name <span>*</span><input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder={`${cfg.singular} name`} required/></label>
      {type==="vendor"&&<label>Company / Business<input value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="Company name"/></label>}
      {isEmployee&&<><label>Employee Category <span>*</span><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{EMPLOYEE_CATEGORIES.map(x=><option key={x}>{x}</option>)}</select></label><label>Designation<input value={form.designation||""} onChange={e=>setForm({...form,designation:e.target.value})} placeholder="e.g. Driver / Accountant"/></label><label>System Role <span>*</span><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>{ROLES.map(x=><option key={x}>{x}</option>)}</select></label><label>Join Date<input type="date" value={form.joinDate||""} onChange={e=>setForm({...form,joinDate:e.target.value})}/></label><label>Salary Amount (৳)<input type="number" min="0" step="0.01" value={form.salaryAmount??"0"} onChange={e=>setForm({...form,salaryAmount:e.target.value})}/></label><label className="people-span-2">Profile Picture<input type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0];if(file){if(file.size>1*1024*1024){setError("Profile picture must be 1 MB or smaller.");return}const reader=new FileReader();reader.onload=()=>setForm(prev=>({...prev,photo:String(reader.result||"")}));reader.readAsDataURL(file)}}}/>{form.photo&&<img className="people-photo-preview" src={form.photo} alt="Employee preview"/>}</label></>}
      <label>Phone {isEmployee&&<span>*</span>}<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="01XXXXXXXXX" required={isEmployee}/></label><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="name@example.com"/></label>
      {type!=="employee"&&<label>Opening Due (৳)<input type="number" min="0" step="0.01" value={form.openingDue} onChange={e=>setForm({...form,openingDue:e.target.value})}/></label>}
      <label className="people-span-2">Address<input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Address"/></label>
      <label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Active</option><option>Inactive</option></select></label><label className="people-span-2">Notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Additional information" rows="2"/></label>
    </div>{isEmployee&&!editing&&<div className="people-login-hint"><KeyRound size={15}/><span>Login will be created automatically: <b>User ID = phone number</b>, <b>Default password = 112233</b>. Reset the password from the employee profile.</span></div>}{error&&<p className="product-form-error">{error}</p>}<div className="product-form-footer"><button type="button" className="button button-secondary" onClick={()=>setModal(false)}>Cancel</button><button className="button button-primary" type="submit">{editing?"Save Changes":`Save ${cfg.singular}`}</button></div></form></section></div>}
    {profile&&<div className="product-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget){setProfile(null);setShowActivityLog(false);setLedgerModal(false);setResetModal(false)}}}><section className={`product-modal people-profile-modal ${isEmployee ? "employee-view-reference-modal" : ""}`} role="dialog" aria-modal="true"><header className="product-modal-header"><div><span className="eyebrow">{cfg.title.toUpperCase()} PROFILE</span><h2>{profile.name}</h2></div><button className="product-modal-close" onClick={()=>{setProfile(null);setShowActivityLog(false)}}><X size={18}/></button></header><div className="people-profile-body"><div className={`people-profile-card ${isEmployee?"employee-profile-card":""}`}><span className="people-profile-avatar">{profile.photo?<img src={profile.photo} alt={`${profile.name} profile`}/>:((profile.name||"?").slice(0,1).toUpperCase())}</span><div><h3>{profile.name}</h3><p>{isEmployee?`${profile.phone||"No phone"} · ${profile.designation||profile.category||"Employee"}`:profile.company||cfg.singular}</p><span className={`product-status ${profile.status==="Active"?"is-active":"is-inactive"}`}><span/>{profile.status||"Active"}</span></div><button className="button button-secondary" onClick={()=>{setProfile(null);openEdit(profile)}}><Pencil size={14}/> Edit Profile</button></div>
      <div className="people-detail-grid">{[["Phone",profile.phone],["Email",profile.email],["Address",profile.address],[isEmployee?"Designation":"Current Balance",isEmployee?(profile.designation||profile.category):money(getPartyBalance(profile))],["Join Date",isEmployee?(profile.joinDate||"—"):dateLabel(profile.createdAt)],["Last Updated",dateLabel(profile.updatedAt)]].map(([label,value])=><div key={label}><small>{label}</small><strong>{value||"—"}</strong></div>)}</div>
      {isEmployee&&<>
        <div className="employee-reference-top">
          <section className="employee-reference-profile">
            <div className="employee-reference-photo">{profile.photo?<img src={profile.photo} alt={`${profile.name} profile`}/>:<span>Photo</span>}</div>
            <button type="button" className="employee-reference-address-btn" onClick={()=>setAddressModalOpen(true)}>Show Address</button>
            <div className="employee-reference-designation">{profile.designation||profile.category||"Employee"}</div>
            <div className="employee-reference-info"><span>Name: <b>{profile.name}</b></span><button type="button" onClick={()=>{setProfile(null);openEdit(profile)}}>Edit</button></div>
            <div className="employee-reference-info"><span>Phone: <b>{profile.phone||"—"}</b></span></div>
            <div className="employee-reference-info"><span>User Name: <b>{profile.userId||profile.phone||"(phone number auto)"}</b></span></div>
            <div className="employee-reference-info"><span>Password: <button type="button" className="employee-reference-text-btn" onClick={openReset}>Show/Hide-Reset Password</button></span></div>
            <button type="button" className="employee-reference-activity-btn" onClick={()=>setShowActivityLog(v=>!v)}><Activity size={14}/>{showActivityLog ? "Hide Activity Log" : "Activity Log"}</button>
          </section>
          <section className="employee-reference-stock" style={isDriverProfile?{display:"none"}:undefined}>
            <div className="employee-reference-stock-heading"><h3>Employee Stock List</h3><strong>Total Amount : {money(reportInRange(stockRows).reduce((sum,r)=>sum+Number(r.totalAmount||r.amount||0),0))} Taka</strong></div>
            <div className="people-table-wrap"><table className="employee-reference-table"><thead><tr><th>SL</th><th>Product Name</th><th>Qty</th><th>Total Amount</th><th>Challan No. / Date</th></tr></thead><tbody>{reportInRange(stockRows).map((r,i)=><tr key={`${r.productId}-${i}`}><td>{i+1}</td><td>{r.productName||"—"}</td><td>{r.quantity||0}</td><td>{money(r.totalAmount||0)}</td><td><select className="employee-challan-select" defaultValue="" onChange={e=>{const d=challans.find(x=>x.number===e.target.value);if(d)setSelectedEmployeeChallan(d);e.target.value=""}}><option value="">View challan ({r.challanRefs?.length||0})</option>{(r.challanRefs||[]).map(c=><option key={c.number} value={c.number}>{c.number} — {c.date}</option>)}</select></td></tr>)}{reportInRange(stockRows).length===0&&<tr><td colSpan="5" className="employee-reference-empty">No issued stock yet</td></tr>}</tbody></table></div>
          </section>
        </div>
        {!isDriverProfile&&<>
        <section className="employee-reference-challans">
          <div className="employee-reference-challan-heading"><h3>Employee Challan List</h3><strong>CHALLAN DUE AMOUNT: {money(reportInRange(challans).reduce((sum,d)=>sum+Math.max(0,Number(d.total||0)-Number(d.paid||0)),0))}</strong><strong>PAID AMOUNT : {money(reportInRange(challans).reduce((sum,d)=>sum+Number(d.paid||0),0))}</strong></div>
          <div className="people-table-wrap"><table className="employee-reference-table"><thead><tr><th>Challan No</th><th>Date</th><th>Total Amount</th><th>Paid Amount</th><th>Due Amount</th><th>Print</th></tr></thead><tbody>{reportInRange(challans).map(d=><tr key={d.id}><td>{d.number||"—"}</td><td>{dateOnly(d.date)}</td><td>{money(d.total||0)}</td><td>{money(d.paid||0)}</td><td>{money(Math.max(0,Number(d.total||0)-Number(d.paid||0)))}</td><td><button type="button" className="employee-reference-print" onClick={()=>setSelectedEmployeeChallan(d)}>View / Print</button></td></tr>)}{reportInRange(challans).length===0&&<tr><td colSpan="6"></td></tr>}</tbody></table></div>
        </section>
        <section className="employee-reference-sale"><h3>Sale List Total</h3><strong>{money(saleListTotal)}</strong></section>
        </>}
        {isDriverProfile&&<section className="driver-rent-profile-grid">
          <div className="driver-rent-history panel"><div className="panel-heading"><div><h3>Daily Rent Collection History</h3><p>Rent entries assigned to {profile.name}</p></div><span>{driverRentEntries.length} entries</span></div>
            <div className="people-table-wrap"><table className="data-table"><thead><tr><th>Date</th><th>Vehicle</th><th>Rent Amount</th><th>Status</th><th>Received At</th></tr></thead><tbody>{driverRentEntries.map(r=><tr key={r.id}><td>{dateOnly(r.date)}</td><td>{r.vehicleName||"—"}</td><td>{money(r.amount)}</td><td><span className={`status-pill ${r.status==="Received"?"status-active":"status-inactive"}`}>{r.status||"Due"}{Number(r.paidAmount||0)>0&&r.status!=="Received"?` · Paid ${money(r.paidAmount)}`:""}</span></td><td>{r.receivedAt?dateLabel(r.receivedAt):"—"}</td></tr>)}{!driverRentEntries.length&&<tr><td colSpan="5" className="empty-state">No daily rent entries are assigned to this driver yet.</td></tr>}</tbody></table></div>
          </div>
          <aside className="driver-rent-ledger panel"><div className="panel-heading"><h3>Driver Rent Ledger</h3></div><div className="driver-rent-ledger-balance"><small>Total Rent</small><strong>{money(driverRentTotal)}</strong></div><div className="driver-rent-ledger-balance"><small>Received / Paid</small><strong className="driver-rent-paid">{money(driverRentReceived)}</strong></div><div className="driver-rent-ledger-balance"><small>Due Balance</small><strong className="driver-rent-due">{money(driverRentDue)}</strong></div><p>Due = Generated rent − Received rent. Mark a daily rent entry as Received in Daily Rent Collection to update this ledger.</p></aside>
        </section>}
      </>}{!isEmployee&&<section className="people-ledger-section"><div className="people-ledger-heading"><div className="people-ledger-section-title"><BookOpen size={16}/><h3>{type === "vendor" ? "Vendor Ledger" : "Customer Ledger"}</h3></div><button className="button button-primary" onClick={openPartyLedger}><Plus size={14}/> Add Transaction</button></div><div className="people-ledger-balances"><div><small>{type === "vendor" ? "We Owe Vendor" : "Customer Owes Us"}</small><strong>{money(Math.max(0, getPartyBalance(profile)))}</strong></div><div><small>{type === "vendor" ? "Vendor Owes Us / Advance" : "Customer Advance / Credit"}</small><strong>{money(Math.max(0, -getPartyBalance(profile)))}</strong></div><div><small>Net Balance</small><strong>{getPartyBalance(profile)>0?money(getPartyBalance(profile))+(type==="vendor"?" payable":" due to us"):getPartyBalance(profile)<0?money(Math.abs(getPartyBalance(profile)))+(type==="vendor"?" receivable":" customer credit"):money(0)}</strong></div></div><p className="people-activity-note">{type === "vendor" ? "Record what goods you received, when and at what value, payments and advances made, and any refunds. Positive balance means you owe the vendor; negative balance means vendor owes you." : "Record what products you gave the customer, dates and prices, payments received and advances. Positive balance means customer owes you; negative balance means the customer has credit with you."}</p><div className="people-table-wrap"><table className="data-table people-ledger-table"><thead><tr><th>Date</th><th>Transaction</th><th>Product / Qty</th><th>Reason / Details</th><th>Reference</th><th>Amount</th><th>Running Balance</th></tr></thead><tbody>{partyEntriesWithBalance(profile).map(entry=><tr key={entry.id}><td>{dateOnly(entry.date)}</td><td><span className="people-chip">{entry.typeLabel}</span></td><td>{entry.product?`${entry.product} / ${entry.quantity||1}`:"—"}</td><td>{entry.reason}</td><td>{entry.reference||"—"}</td><td><strong>{money(entry.amount)}</strong></td><td><strong>{money(entry.runningBalance)}</strong>{entry.runningBalance>0?<small> {type==="vendor"?"payable":"due"}</small>:entry.runningBalance<0?<small> {type==="vendor"?"receivable":"credit"}</small>:null}</td></tr>)}{partyEntries(profile).length===0&&<tr><td colSpan="7"><div className="people-no-activity"><Wallet size={20}/><span>No transactions yet. Add products, payments or advances to start this ledger.</span></div></td></tr>}</tbody></table></div></section>}
      {isEmployee && showActivityLog && (
        <div className="people-activity">
          <div className="people-activity-heading">
            <div><Activity size={17}/><h3>Activity Log</h3></div>
            <span>{reportInRange(relatedLogs(profile)).length} activities</span>
          </div>
          <p className="people-activity-note">Date/time, module and action are recorded for changes made in this prototype. Other modules will appear here after their activity tracking is connected.</p>
          {reportInRange(relatedLogs(profile)).length === 0 ? (
            <div className="people-no-activity"><CalendarDays size={20}/><span>No activity recorded for this profile yet.</span></div>
          ) : (
            <div className="people-log-table-wrap">
              <table className="data-table people-log-table">
                <thead><tr><th>Date &amp; Time</th><th>Module</th><th>Action</th><th>Details</th></tr></thead>
                <tbody>{reportInRange(relatedLogs(profile)).map(log => (
                  <tr key={log.id}><td>{dateLabel(log.date)}</td><td>{log.module}</td><td>{log.action}</td><td>{log.details}</td></tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
      </div></section></div>}
    {profile&&isEmployee&&addressModalOpen&&<div className="product-modal-backdrop employee-inner-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setAddressModalOpen(false)}}><section className="product-modal employee-inner-modal" role="dialog" aria-modal="true"><header className="product-modal-header"><div><span className="eyebrow">EMPLOYEE ADDRESS</span><h2>{profile.name}</h2></div><button className="product-modal-close" onClick={()=>setAddressModalOpen(false)}><X size={18}/></button></header><div className="employee-inner-content"><b>Address</b><p>{profile.address||"No address has been added."}</p></div><div className="product-form-footer"><button className="button button-secondary" onClick={()=>setAddressModalOpen(false)}>Close</button></div></section></div>}
    {profile&&isEmployee&&selectedEmployeeChallan&&<div className="product-modal-backdrop employee-inner-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedEmployeeChallan(null)}}><section className="product-modal employee-challan-preview-modal" role="dialog" aria-modal="true"><header className="product-modal-header"><div><span className="eyebrow">EMPLOYEE CHALLAN VOUCHER</span><h2>{selectedEmployeeChallan.number}</h2></div><button className="product-modal-close" onClick={()=>setSelectedEmployeeChallan(null)}><X size={18}/></button></header><div className="employee-challan-preview-paper" id="employee-challan-print"><div className="employee-challan-paper-brand"><h2>{localStorage.getItem("shopflow.companyName")||"SHOPFLOW"}</h2><p>{localStorage.getItem("shopflow.companyAddress")||"Company Common Pad"}</p><h3>EMPLOYEE CHALLAN</h3></div><div className="employee-challan-paper-meta"><span><b>Challan No:</b> {selectedEmployeeChallan.number}</span><span><b>Date:</b> {dateOnly(selectedEmployeeChallan.date)}</span><span><b>Employee:</b> {profile.name}</span><span><b>Created By:</b> {selectedEmployeeChallan.createdBy||"Admin"}</span></div><div className="people-table-wrap"><table className="employee-reference-table"><thead><tr><th>SL</th><th>Product</th><th>Quantity</th><th>Rate</th><th>Total Amount</th></tr></thead><tbody>{(selectedEmployeeChallan.items||[]).map((it,i)=><tr key={`${it.productId}-${i}`}><td>{i+1}</td><td>{it.productName||"Product"}</td><td>{it.quantity}</td><td>{money(it.price)}</td><td>{money(it.total??Number(it.quantity||0)*Number(it.price||0))}</td></tr>)}</tbody></table></div><div className="employee-challan-paper-totals"><p><b>Total:</b> {money(selectedEmployeeChallan.total)}</p><p><b>Paid:</b> {money(selectedEmployeeChallan.paid||0)}</p><p><b>Due:</b> {money(Math.max(0,Number(selectedEmployeeChallan.total||0)-Number(selectedEmployeeChallan.paid||0)))}</p></div><div className="employee-challan-paper-sign"><span>Employee Signature</span><span>Authorized Signature</span></div></div><div className="product-form-footer"><button className="button button-secondary" onClick={()=>setSelectedEmployeeChallan(null)}>Close</button><button className="button button-primary" onClick={()=>window.print()}><FileText size={14}/> Print Voucher</button></div></section></div>}
    {partyLedgerModal&&profile&&!isEmployee&&<div className="product-modal-backdrop people-nested-modal" onMouseDown={e=>{if(e.target===e.currentTarget)setPartyLedgerModal(false)}}><section className="product-modal" role="dialog" aria-modal="true"><header className="product-modal-header"><div><h2>{type === "vendor" ? "Add Vendor Transaction" : "Add Customer Transaction"}</h2><p className="people-modal-subtitle">{cfg.singular}: {profile.name}</p></div><button className="product-modal-close" onClick={()=>setPartyLedgerModal(false)}><X size={18}/></button></header><form className="product-form" onSubmit={savePartyLedger}><div className="product-form-grid"><label>Transaction Type <span>*</span><select value={partyLedgerForm.type} onChange={e=>setPartyLedgerForm({...partyLedgerForm,type:e.target.value})}>{PARTY_TYPES.map(t=><option value={t.value} key={t.value}>{t.label}</option>)}</select></label><label>Date <span>*</span><input type="date" value={partyLedgerForm.date} onChange={e=>setPartyLedgerForm({...partyLedgerForm,date:e.target.value})} required/></label><label>Amount (৳) <span>*</span><input type="number" min="0.01" step="0.01" value={partyLedgerForm.amount} onChange={e=>setPartyLedgerForm({...partyLedgerForm,amount:e.target.value})} required placeholder="0.00"/></label><label>Product / Item Name<input value={partyLedgerForm.product} onChange={e=>setPartyLedgerForm({...partyLedgerForm,product:e.target.value})} placeholder="Product name, if applicable"/></label><label>Quantity<input type="number" min="0.01" step="0.01" value={partyLedgerForm.quantity} onChange={e=>setPartyLedgerForm({...partyLedgerForm,quantity:e.target.value})}/></label><label>Reference / Voucher No.<input value={partyLedgerForm.reference} onChange={e=>setPartyLedgerForm({...partyLedgerForm,reference:e.target.value})} placeholder="Optional reference"/></label><label className="people-span-2">Reason / Details <span>*</span><textarea value={partyLedgerForm.reason} onChange={e=>setPartyLedgerForm({...partyLedgerForm,reason:e.target.value})} required placeholder={type === "vendor" ? "E.g. goods received, advance for next purchase..." : "E.g. products delivered, payment received for invoice..."} rows="3"/></label></div>{partyLedgerError&&<p className="product-form-error">{partyLedgerError}</p>}<div className="product-form-footer"><button type="button" className="button button-secondary" onClick={()=>setPartyLedgerModal(false)}>Cancel</button><button className="button button-primary" type="submit">Save Transaction</button></div></form></section></div>}
    {ledgerModal&&profile&&<div className="product-modal-backdrop people-nested-modal" onMouseDown={e=>{if(e.target===e.currentTarget)setLedgerModal(false)}}><section className="product-modal" role="dialog" aria-modal="true"><header className="product-modal-header"><div><h2>Add Ledger Entry</h2><p className="people-modal-subtitle">Employee: {profile.name}</p></div><button className="product-modal-close" onClick={()=>setLedgerModal(false)}><X size={18}/></button></header><form className="product-form" onSubmit={saveLedger}><div className="product-form-grid"><label>Transaction Type <span>*</span><select value={ledgerForm.type} onChange={e=>setLedgerForm({...ledgerForm,type:e.target.value})}>{LEDGER_TYPES.map(t=><option value={t.value} key={t.value}>{t.label}</option>)}</select></label><label>Date <span>*</span><input type="date" value={ledgerForm.date} onChange={e=>setLedgerForm({...ledgerForm,date:e.target.value})} required/></label><label>Amount (৳) <span>*</span><input type="number" min="0.01" step="0.01" value={ledgerForm.amount} onChange={e=>setLedgerForm({...ledgerForm,amount:e.target.value})} required placeholder="0.00"/></label>{ledgerForm.type==="product_issued"&&<><label>Product Name <span>*</span><input value={ledgerForm.product} onChange={e=>setLedgerForm({...ledgerForm,product:e.target.value})} required placeholder="Product / item name"/></label><label>Quantity<input type="number" min="0.01" step="0.01" value={ledgerForm.quantity} onChange={e=>setLedgerForm({...ledgerForm,quantity:e.target.value})}/></label></>}<label>Reference / Voucher No.<input value={ledgerForm.reference} onChange={e=>setLedgerForm({...ledgerForm,reference:e.target.value})} placeholder="Optional reference"/></label><label className="people-span-2">Reason / Details <span>*</span><textarea value={ledgerForm.reason} onChange={e=>setLedgerForm({...ledgerForm,reason:e.target.value})} required placeholder="Why is this salary, product issue or payment being recorded?" rows="3"/></label></div>{ledgerError&&<p className="product-form-error">{ledgerError}</p>}<div className="product-form-footer"><button type="button" className="button button-secondary" onClick={()=>setLedgerModal(false)}>Cancel</button><button className="button button-primary" type="submit">Save Ledger Entry</button></div></form></section></div>}
    {resetModal&&profile&&<div className="product-modal-backdrop people-nested-modal" onMouseDown={e=>{if(e.target===e.currentTarget)setResetModal(false)}}><section className="product-modal" role="dialog" aria-modal="true"><header className="product-modal-header"><div><h2>Reset Employee Password</h2><p className="people-modal-subtitle">User ID: {profile.userId||profile.phone}</p></div><button className="product-modal-close" onClick={()=>setResetModal(false)}><X size={18}/></button></header><form className="product-form" onSubmit={resetPassword}><div className="product-form-grid"><label>New Password <span>*</span><input type="password" minLength="6" autoComplete="new-password" value={resetForm.password} onChange={e=>setResetForm({...resetForm,password:e.target.value})} required/></label><label>Confirm New Password <span>*</span><input type="password" minLength="6" autoComplete="new-password" value={resetForm.confirm} onChange={e=>setResetForm({...resetForm,confirm:e.target.value})} required/></label></div><p className="people-password-warning">For a manual reset to the default, enter <b>112233</b> in both fields. This prototype stores login records in this browser only; use a secure backend with hashed passwords before real deployment.</p>{resetMessage&&<p className="product-form-error">{resetMessage}</p>}<div className="product-form-footer"><button type="button" className="button button-secondary" onClick={()=>setResetModal(false)}>Cancel</button><button className="button button-primary" type="submit"><KeyRound size={14}/> Reset Password</button></div></form></section></div>}
  </div>;
}
