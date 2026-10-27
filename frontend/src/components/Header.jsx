import { Bell, Search, Menu, ChevronDown } from "lucide-react";

export default function Header({ onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button mobile-menu" onClick={onMenuClick} aria-label="Open menu"><Menu size={21} /></button>
        <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>Shop Management</strong></div>
      </div>
      <div className="topbar-actions">
        <label className="search-box">
          <Search size={17} />
          <input type="search" placeholder="Search anything..." aria-label="Search" />
          <kbd>⌘ K</kbd>
        </label>
        <button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /><i /></button>
        <div className="topbar-divider" />
        <div className="user-chip">
          <div className="avatar">AD</div>
          <div className="user-chip-copy"><strong>Admin User</strong><small>Administrator</small></div>
          <ChevronDown size={16} className="muted-icon" />
        </div>
      </div>
    </header>
  );
}
