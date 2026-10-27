import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, ChevronLeft, LogOut, Store, X } from "lucide-react";
import { menuItems } from "../data/menu";

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  function signOut() {
    navigate("/login");
    setMobileOpen(false);
  }

  return (
    <>
      {mobileOpen && <button className="mobile-overlay" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><Store size={22} /></div>
          {!collapsed && <div className="brand-copy"><strong>Shop<span>Flow</span></strong><small>MANAGEMENT SYSTEM</small></div>}
          <button className="icon-button collapse-button" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <Menu size={19} /> : <ChevronLeft size={19} />}
          </button>
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={19} /></button>
        </div>

        <div className="nav-caption">{!collapsed && "WORKSPACE"}</div>
        <nav className="sidebar-nav">
          {menuItems.map(({ label, path, icon: Icon, children }) => (
            <div className="nav-group" key={path}>
              <NavLink to={path} title={collapsed ? label : undefined} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <Icon size={19} strokeWidth={1.9} />
                {!collapsed && <span>{label}</span>}
                {!collapsed && label === "Dashboard" && <span className="nav-dot" />}
              </NavLink>
              {children && !collapsed && <div className="nav-submenu">{children.map(({label: childLabel,path:childPath,icon:ChildIcon})=><NavLink key={childPath} to={childPath} className={({isActive})=>`nav-sub-link ${isActive?"active":""}`} onClick={()=>setMobileOpen(false)}><ChildIcon size={15}/><span>{childLabel}</span></NavLink>)}</div>}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-link signout-link" onClick={signOut} title={collapsed ? "Sign Out" : undefined}>
            <LogOut size={19} /><span className={collapsed ? "sr-only" : ""}>Sign Out</span>
          </button>
          {!collapsed && <div className="sidebar-footnote">© 2026 ShopFlow<br />Built for your business</div>}
        </div>
      </aside>
    </>
  );
}
