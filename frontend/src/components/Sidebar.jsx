import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, ChevronLeft, Store, X } from "lucide-react";
import { menuItems } from "../data/menu";

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const role=localStorage.getItem("shopflow.currentRole")||"Administrator";
  const employeeMode=role==="Employee"||role==="Sales";
  const employeePaths=["/employee-dashboard","/challan","/sale","/stock","/customer","/pre-order","/expense","/reports","/profile"];
  const visibleItems=employeeMode?menuItems.filter(item=>employeePaths.includes(item.path)):menuItems;

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
          {visibleItems.map(({ label, path, icon: Icon, children }) => (
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

      </aside>
    </>
  );
}
