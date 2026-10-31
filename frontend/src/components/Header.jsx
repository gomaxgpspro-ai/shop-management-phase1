import { Bell, Search, Menu, AlertTriangle, PackageCheck, X, UserRound, Settings, Activity, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||"[]")}catch{return []}};
export default function Header({ onMenuClick }) {
  const [noticeOpen,setNoticeOpen]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);
  const navigate=useNavigate();
  const role=localStorage.getItem("shopflow.currentRole")||"Administrator";
  const avatar=localStorage.getItem("shopflow.profilePicture");
  const products=read("shopflow.products.v1");
  const movements=read("shopflow.inventoryMovements.v1");
  const alerts=useMemo(()=>products.map(p=>{
    const stock=movements.filter(m=>m.productId===p.id).reduce((sum,m)=>sum+Number(m.mainDelta||0),0);
    const threshold=Number(p.lowStockAlert??5);
    return {...p,stock,threshold};
  }).filter(p=>p.status!=="Inactive"&&p.stock<=p.threshold).sort((a,b)=>a.stock-b.stock),[products,movements]);
  return <header className="topbar">
    <div className="topbar-left"><button className="icon-button mobile-menu" onClick={onMenuClick} aria-label="Open menu"><Menu size={21} /></button><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>Shop Management</strong></div></div>
    <div className="topbar-actions"><label className="search-box"><Search size={17}/><input type="search" placeholder="Search anything..." aria-label="Search"/><kbd>⌘ K</kbd></label>
      <div className="notification-wrap"><button className="icon-button notification-button" aria-label="Low stock notifications" aria-expanded={noticeOpen} onClick={()=>setNoticeOpen(v=>!v)}><Bell size={19}/>{alerts.length>0&&<i/>}</button>
      {noticeOpen&&<div className="notification-dropdown"><div className="notification-head"><div><strong>Notification Center</strong><small>{alerts.length} low-stock alert{alerts.length===1?"":"s"}</small></div><button className="notification-close" onClick={()=>setNoticeOpen(false)} aria-label="Close notifications"><X size={16}/></button></div>
        {alerts.length===0?<div className="notification-empty"><PackageCheck size={24}/><strong>All stock levels look good</strong><span>Low stock alerts will appear here.</span></div>:<div className="notification-list">{alerts.map(p=><div className="notification-item" key={p.id}><span className="notification-alert-icon"><AlertTriangle size={16}/></span><div><strong>{p.name}</strong><small>{p.stock} {p.unit||"units"} remaining · alert at {p.threshold}</small></div><span className="notification-low">Low</span></div>)}</div>}
      </div>}</div><div className="profile-wrap"><button className="profile-trigger" onClick={()=>setProfileOpen(v=>!v)} aria-expanded={profileOpen}><span className="profile-avatar">{avatar?<img src={avatar} alt="Profile"/>:<UserRound size={16}/>}</span><span className="profile-trigger-copy"><strong>{localStorage.getItem("shopflow.currentUser")||"Admin"}</strong><small>{role}</small></span><ChevronDown size={14}/></button>{profileOpen&&<div className="profile-dropdown"><a href="/profile"><UserRound size={15}/> Profile</a><a href="/setting"><Settings size={15}/> Settings</a><a href="/reports"><Activity size={15}/> Activity</a><button onClick={()=>{setProfileOpen(false);setNoticeOpen(true)}}><Bell size={15}/> Notification Center {alerts.length>0&&<b>{alerts.length}</b>}</button><button onClick={()=>{localStorage.removeItem("shopflow.currentUser");localStorage.removeItem("shopflow.currentRole");navigate("/login")}}><UserRound size={15}/> Sign Out</button></div>}</div>
    </div>
  </header>;
}
