import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="main-area">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="page-content"><Outlet /></main>
        <footer className="app-footer"><span>© 2026 ShopFlow</span><span>Shop Management System <b>•</b> Phase 1 UI</span></footer>
      </div>
    </div>
  );
}
