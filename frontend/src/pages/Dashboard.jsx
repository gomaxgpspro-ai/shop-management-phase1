import {
  ArrowDownRight, ArrowUpRight, Banknote, Boxes, ChartNoAxesCombined,
  ShoppingBag, Download, Plus, MoreHorizontal, TrendingUp, Clock3
} from "lucide-react";
import PageHeader from "../components/PageHeader";

const stats = [
  { label: "Total Sales", value: "৳ 1,24,500", change: "+12.8%", positive: true, icon: Banknote, tone: "purple", note: "vs. last month" },
  { label: "Total Purchase", value: "৳ 82,300", change: "+8.2%", positive: true, icon: ShoppingBag, tone: "blue", note: "vs. last month" },
  { label: "Stock Items", value: "1,248", change: "+4.6%", positive: true, icon: Boxes, tone: "orange", note: "vs. last month" },
  { label: "Net Profit", value: "৳ 42,200", change: "+10.4%", positive: true, icon: ChartNoAxesCombined, tone: "green", note: "vs. last month" }
];

const transactions = [
  { id: "#INV-1048", customer: "Rahim Enterprise", date: "26 Oct, 2026", amount: "৳ 12,500", status: "Paid", initials: "RE", color: "lavender" },
  { id: "#INV-1047", customer: "Karim Traders", date: "26 Oct, 2026", amount: "৳ 8,200", status: "Pending", initials: "KT", color: "peach" },
  { id: "#INV-1046", customer: "Nahar Store", date: "25 Oct, 2026", amount: "৳ 4,750", status: "Paid", initials: "NS", color: "mint" },
  { id: "#INV-1045", customer: "M/S Alif & Co.", date: "25 Oct, 2026", amount: "৳ 16,000", status: "Overdue", initials: "AC", color: "blue" },
  { id: "#INV-1044", customer: "Sarker Brothers", date: "24 Oct, 2026", amount: "৳ 3,600", status: "Paid", initials: "SB", color: "pink" }
];

const bars = [38, 54, 43, 69, 49, 78, 61, 46, 83, 64, 91, 72];

export default function Dashboard() {
  return (
    <>
      <PageHeader
        eyebrow="OVERVIEW"
        title="Dashboard"
        description="Welcome back! Here's what's happening with your shop today."
        actions={<><button className="button button-secondary"><Download size={16} /> Export</button><button className="button button-primary"><Plus size={17} /> Add New</button></>}
      />
      <div className="dashboard-toolbar">
        <div className="date-label"><Clock3 size={15} /> Monday, October 26, 2026</div>
        <span className="demo-label"><i /> Demo preview data</span>
      </div>

      <section className="stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;
          return <article className="stat-card" key={item.label}>
            <div className="stat-top"><div className={`stat-icon ${item.tone}`}><Icon size={20} /></div><button className="icon-button subtle-icon" aria-label={`More options for ${item.label}`}><MoreHorizontal size={19} /></button></div>
            <div className="stat-label">{item.label}</div>
            <div className="stat-value">{item.value}</div>
            <div className="stat-foot"><span className="trend-positive"><ArrowUpRight size={15} /> {item.change}</span><span>{item.note}</span></div>
          </article>;
        })}
      </section>

      <section className="dashboard-grid">
        <article className="panel sales-panel">
          <div className="panel-heading">
            <div><h2>Sales Overview</h2><p>Sales performance throughout the year</p></div>
            <button className="select-button">Last 12 months <span>⌄</span></button>
          </div>
          <div className="chart-summary"><strong>৳ 8,42,650</strong><span className="trend-positive"><ArrowUpRight size={15} /> 14.6%</span><small>vs. previous period</small></div>
          <div className="chart-area">
            <div className="chart-y-labels"><span>৳ 1.0L</span><span>৳ 75k</span><span>৳ 50k</span><span>৳ 25k</span><span>৳ 0</span></div>
            <div className="bar-chart">
              {[100,75,50,25,0].map(v => <div className="chart-gridline" key={v} style={{bottom: `${v}%`}} />)}
              <div className="bars">{bars.map((height, i) => <div className="bar-column" key={i}><div className={`bar ${i === 10 ? "highlight" : ""}`} style={{height: `${height}%`}} /></div>)}</div>
            </div>
          </div>
          <div className="chart-x-labels">{["Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"].map(m => <span key={m}>{m}</span>)}</div>
        </article>

        <article className="panel quick-panel">
          <div className="panel-heading"><div><h2>Quick Actions</h2><p>Common tasks at your fingertips</p></div></div>
          <div className="quick-actions">
            <button><span className="quick-icon purple"><Plus size={18}/></span><span><b>New Sale</b><small>Create a sales invoice</small></span><ArrowUpRight size={16} /></button>
            <button><span className="quick-icon blue"><ShoppingBag size={18}/></span><span><b>New Purchase</b><small>Record stock purchase</small></span><ArrowUpRight size={16} /></button>
            <button><span className="quick-icon orange"><Boxes size={18}/></span><span><b>Add Product</b><small>Add an item to inventory</small></span><ArrowUpRight size={16} /></button>
            <button><span className="quick-icon green"><Banknote size={18}/></span><span><b>Record Expense</b><small>Track shop expenses</small></span><ArrowUpRight size={16} /></button>
          </div>
          <div className="quick-footer"><TrendingUp size={16} /><span>Tip: Keep your inventory up to date for accurate reports.</span></div>
        </article>
      </section>

      <section className="panel transactions-panel">
        <div className="panel-heading transaction-heading"><div><h2>Recent Transactions</h2><p>A quick look at your latest invoices</p></div><button className="button button-secondary small-button">View all <ArrowUpRight size={15}/></button></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>INVOICE</th><th>CUSTOMER</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th><th></th></tr></thead>
            <tbody>{transactions.map(t => <tr key={t.id}>
              <td className="invoice-id">{t.id}</td>
              <td><div className="customer-cell"><span className={`customer-avatar ${t.color}`}>{t.initials}</span><strong>{t.customer}</strong></div></td>
              <td className="date-cell">{t.date}</td><td className="amount-cell">{t.amount}</td>
              <td><span className={`status-badge ${t.status.toLowerCase()}`}>{t.status}</span></td>
              <td><button className="icon-button subtle-icon" aria-label={`More options ${t.id}`}><MoreHorizontal size={18}/></button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="table-foot"><span>Showing <b>5</b> of <b>128</b> transactions</span><div><button disabled>Previous</button><button>Next <ArrowUpRight size={13}/></button></div></div>
      </section>
    </>
  );
}
