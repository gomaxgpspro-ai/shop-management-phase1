import { Construction, ArrowUpRight } from "lucide-react";
import PageHeader from "./PageHeader";

export default function PlaceholderPage({ title, description }) {
  return (
    <>
      <PageHeader title={title} description={description || `Manage your ${title.toLowerCase()} workspace from this page.`} />
      <section className="placeholder-panel">
        <div className="placeholder-icon"><Construction size={25} /></div>
        <h2>{title} workspace</h2>
        <p>This page is ready for the next development phase.</p>
        <div className="placeholder-note"><span className="status-dot" /> UI scaffold is active <ArrowUpRight size={15} /></div>
        <small>Phase 1 only — no database or business logic connected.</small>
      </section>
    </>
  );
}
