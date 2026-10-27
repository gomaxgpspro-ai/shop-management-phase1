import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Package, Pencil, Trash2, X, CheckCircle2, CircleOff, Boxes } from "lucide-react";

const STORAGE_KEY = "shopflow.products.v1";
const units = ["pcs", "kg", "set", "carton", "ltr", "meter", "feet", "box", "dozen", "pack", "roll", "pair", "gram", "ton", "other"];
const blankForm = { name: "", category: "", unit: "pcs", purchasePrice: "", status: "Active" };

function loadProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function ProductPage() {
  const [products, setProducts] = useState(loadProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState("");

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); } catch { /* storage may be unavailable */ }
  }, [products]);

  const filteredProducts = useMemo(() => products.filter((p) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [p.name, p.category, p.unit].some((v) => String(v || "").toLowerCase().includes(term));
    return matchesSearch && (statusFilter === "All" || p.status === statusFilter);
  }), [products, search, statusFilter]);

  const activeCount = products.filter((p) => p.status === "Active").length;
  const inactiveCount = products.length - activeCount;

  function openAdd() {
    setEditingId(null); setForm(blankForm); setError(""); setModalOpen(true);
  }
  function openEdit(product) {
    setEditingId(product.id);
    setForm({ name: product.name || "", category: product.category || "", unit: product.unit || "pcs", purchasePrice: String(product.purchasePrice ?? ""), status: product.status || "Active" });
    setError(""); setModalOpen(true);
  }
  function saveProduct(event) {
    event.preventDefault();
    if (!form.name.trim()) { setError("Product name is required."); return; }
    if (form.purchasePrice === "" || !Number.isFinite(Number(form.purchasePrice)) || Number(form.purchasePrice) < 0) { setError("Enter a valid purchase price."); return; }
    const product = { id: editingId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: form.name.trim(), category: form.category.trim(), unit: form.unit, purchasePrice: Number(form.purchasePrice), status: form.status };
    setProducts((prev) => editingId ? prev.map((p) => p.id === editingId ? product : p) : [...prev, product]);
    setModalOpen(false); setForm(blankForm); setEditingId(null); setError("");
  }
  function deleteProduct(product) {
    if (window.confirm(`Delete product “${product.name}”?`)) setProducts((prev) => prev.filter((p) => p.id !== product.id));
  }
  function toggleStatus(product) {
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p));
  }
  const money = (value) => `৳ ${Number(value || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="product-page">
      <div className="product-compact-header">
        <h1>Product</h1>
        <div className="product-summary-grid">
          <div className="product-summary-card"><span className="product-summary-icon"><Package size={15} /></span><div><small>Total Products</small><strong>{products.length}</strong></div></div>
          <div className="product-summary-card"><span className="product-summary-icon product-green"><CheckCircle2 size={15} /></span><div><small>Active</small><strong>{activeCount}</strong></div></div>
          <div className="product-summary-card"><span className="product-summary-icon product-gray"><CircleOff size={15} /></span><div><small>Inactive</small><strong>{inactiveCount}</strong></div></div>
        </div>
        <button className="button button-primary product-add-button" onClick={openAdd}><Plus size={15} /> Add New</button>
      </div>

      <section className="product-list-panel">
        <div className="product-list-toolbar">
          <div className="product-list-title"><span className="product-list-icon"><Boxes size={18} /></span><div><h2>Product List</h2><p>{filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} found</p></div></div>
          <div className="product-list-controls">
            <label className="product-search"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product..." /></label>
            <select aria-label="Filter product status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>All</option><option>Active</option><option>Inactive</option></select>
          </div>
        </div>
        <div className="product-table-wrap">
          <table className="data-table product-table">
            <thead><tr><th>SL</th><th>Name</th><th>Category</th><th>Unit</th><th>Purchase Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredProducts.map((product, index) => <tr key={product.id}>
                <td>{index + 1}</td>
                <td><strong className="product-name-cell">{product.name}</strong></td>
                <td>{product.category || <span className="product-muted">—</span>}</td>
                <td><span className="product-unit-pill">{product.unit}</span></td>
                <td><strong className="product-price-cell">{money(product.purchasePrice)}</strong></td>
                <td><span className={`product-status ${product.status === "Active" ? "is-active" : "is-inactive"}`}><span />{product.status}</span></td>
                <td><div className="product-row-actions"><button type="button" title="Edit product" aria-label={`Edit ${product.name}`} onClick={() => openEdit(product)}><Pencil size={15} /></button><button type="button" title={product.status === "Active" ? "Set inactive" : "Set active"} aria-label={product.status === "Active" ? `Set ${product.name} inactive` : `Set ${product.name} active`} onClick={() => toggleStatus(product)}>{product.status === "Active" ? <CircleOff size={15} /> : <CheckCircle2 size={15} />}</button><button type="button" className="product-delete-button" title="Delete product" aria-label={`Delete ${product.name}`} onClick={() => deleteProduct(product)}><Trash2 size={15} /></button></div></td>
              </tr>)}
              {filteredProducts.length === 0 && <tr><td colSpan="7"><div className="product-empty"><span><Package size={22} /></span><strong>{products.length ? "No matching products" : "No products added yet"}</strong><p>{products.length ? "Try another search or status filter." : "Click Add New to create your first product."}</p>{!products.length && <button className="button button-primary" onClick={openAdd}><Plus size={15} /> Add New Product</button>}</div></td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && <div className="product-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
          <header className="product-modal-header"><div><span className="eyebrow">PRODUCT CATALOGUE</span><h2 id="product-modal-title">{editingId ? "Edit Product" : "Add New Product"}</h2></div><button className="product-modal-close" type="button" aria-label="Close" onClick={() => setModalOpen(false)}><X size={19} /></button></header>
          <form className="product-form" onSubmit={saveProduct}>
            <div className="product-form-grid">
              <label>Product Name <span>*</span><input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" /></label>
              <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Electronics" /></label>
              <label>Unit <span>*</span><select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>{units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></label>
              <label>Purchase Price (৳) <span>*</span><input type="number" min="0" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} placeholder="0.00" /></label>
              <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option></select></label>
            </div>
            {error && <p className="product-form-error">{error}</p>}
            <div className="product-form-footer"><button type="button" className="button button-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="button button-primary">{editingId ? "Save Changes" : "Save Product"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}
