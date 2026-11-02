"use client";

import "./CivilServicesDirectory.css";

import { useEffect, useMemo, useState } from "react";
import { Search, Shield, Landmark, ArrowUpDown, SearchX, BadgeCheck, X, ChevronRight, BriefcaseBusiness, ShieldCheck } from "lucide-react";

type Officer = {
  id: number;
  full_name: string;
  service_type: "IAS" | "IPS";
  batch_year: number | null;
  cadre: string | null;
  employee_id: string;
  current_designation: string | null;
  current_department: string | null;
  posting_location: string | null;
  recruitment_type: string | null;
  education: string | null;
  pay_level: string | null;
  source_name: string | null;
  source_snapshot_date: string | null;
  verification_status: string | null;
};

const initials = (name: string) => name.split(/\\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();

export default function CivilServicesDirectory() {
  const [service, setService] = useState<"IPS" | "IAS">("IPS");
  const [query, setQuery] = useState("");
  const [seniorFirst, setSeniorFirst] = useState(true);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Officer | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ service, q: query, cadre: "Tamil Nadu" });
      try {
        const response = await fetch("/api/civil-services?" + params.toString(), { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load officers");
        setOfficers(Array.isArray(data.officers) ? data.officers : []);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Unable to load officers");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [service, query]);

  const filtered = useMemo(() => [...officers].sort((a, b) => {
    const left = a.batch_year ?? (seniorFirst ? 9999 : 0);
    const right = b.batch_year ?? (seniorFirst ? 9999 : 0);
    return seniorFirst ? left - right : right - left;
  }), [officers, seniorFirst]);

  const sourceLabel = useMemo(() => {
    const labels = Array.from(new Set(officers.map(officer => officer.source_name).filter(Boolean)));
    return labels.length === 1 ? labels[0] : "Tamil Nadu Cadre · Officer Records";
  }, [officers]);

  return (
    <div className={`cs-directory cs-theme-${service.toLowerCase()}`}>
      <section className="cs-workspace">
        <header className="cs-reference-header">
          <div className="cs-reference-brand">
            <span className="cs-reference-logo">
              {service === "IPS" ? <Shield size={19} strokeWidth={2.2} /> : <Landmark size={19} strokeWidth={2.2} />}
            </span>
            <div className="cs-reference-heading">
              <h1>Civil Services Directory</h1>
              <p>{sourceLabel}</p>
            </div>
            <span className="cs-reference-status"><span />{officers.some(o => o.source_snapshot_date) ? "Updated" : "Directory"}</span>
          </div>

          <div className="cs-reference-controls">
            <div className="cs-reference-tabs" role="tablist" aria-label="Civil service">
              {(["IAS", "IPS"] as const).map(s => (
                <button key={s} type="button" role="tab" aria-selected={service === s} onClick={() => { setService(s); setSelected(null); }} className={service === s ? "active" : ""}>
                  <span className={service === s ? (s === "IPS" ? "ips-icon" : "ias-icon") : ""}>{s === "IPS" ? <Shield size={15} /> : <Landmark size={15} />}</span>
                  {s}
                  <small>{officers.length && service === s ? filtered.length : " "}</small>
                </button>
              ))}
            </div>
            <label className="cs-reference-search">
              <Search size={16} />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${service} by name, role, state, batch…`} />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={13} /></button>}
            </label>
          </div>
        </header>

        <div className="cs-reference-columns">
          <button type="button" onClick={() => setSeniorFirst(value => !value)} title="Sort by seniority"># <ArrowUpDown size={11} /></button>
          <span className="cs-reference-officer-col">OFFICER</span>
          <span className="cs-reference-role-col">CURRENT ROLE</span>
          <span className="cs-reference-cadre-col">CADRE</span>
          <span className="cs-reference-chevron-col" />
        </div>

        <div className="cs-reference-list">
          {loading && <div className="cs-reference-state">Loading officer records…</div>}
          {!loading && error && <div className="cs-reference-state cs-error">{error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className="cs-reference-empty">
              <span><SearchX size={20} /></span>
              <strong>No {service} officers found</strong>
              <small>Try a different name, role or batch year.</small>
              {query && <button type="button" onClick={() => setQuery("")}>Clear search</button>}
            </div>
          )}
          {!loading && !error && filtered.map((officer, index) => (
            <button type="button" key={officer.id} className={`cs-reference-row${selected?.id === officer.id ? " selected" : ""}`} onClick={() => setSelected(officer)}>
              <span className={`cs-reference-rank${index < 3 ? " top" : ""}`}>{String(index + 1).padStart(2, "0")}</span>
              <span className="cs-reference-officer">
                <span className="cs-reference-avatar">{initials(officer.full_name)}</span>
                <span className="cs-reference-officer-copy">
                  <strong>{officer.full_name}{index === 0 && <BadgeCheck size={13} />}</strong>
                  <small>{officer.employee_id} · {officer.batch_year ?? "Batch not listed"} Batch</small>
                  <small className="cs-reference-mobile-role">{officer.current_designation || "Role not listed"}</small>
                </span>
              </span>
              <span className="cs-reference-role">
                <strong>{officer.current_designation || "Role not listed"}</strong>
                <small>{[officer.current_department, officer.posting_location].filter(Boolean).join(" · ")}</small>
              </span>
              <span className="cs-reference-cadre">
                <strong>{officer.cadre || "—"}</strong>
                <small>{officer.recruitment_type || officer.source_name || "—"}</small>
              </span>
              <ChevronRight className="cs-reference-chevron" size={16} />
            </button>
          ))}
        </div>

        <footer className="cs-reference-footer">
          <p>Showing <strong>{filtered.length}</strong> of <strong>{officers.length}</strong> {service} officers</p>
          <p>Sorted by {seniorFirst ? "seniority" : "juniority"}</p>
        </footer>
      </section>

      {selected && (
        <aside className="cs-selected-card">
          <button className="cs-close" onClick={() => setSelected(null)} aria-label="Close officer details">×</button>
          <div className="cs-card-kicker">{selected.service_type} · OFFICER PROFILE</div>
          <div className="cs-card-avatar">{initials(selected.full_name)}</div>
          <h2>{selected.full_name}</h2>
          <p>{selected.current_designation || "Designation not listed"}</p>
          <div className="cs-card-grid">
            <div><small>Cadre</small><strong>{selected.cadre || "—"}</strong></div>
            <div><small>Batch</small><strong>{selected.batch_year || "—"}</strong></div>
            <div><small>Employee ID</small><strong>{selected.employee_id}</strong></div>
            <div><small>Pay level</small><strong>{selected.pay_level || "—"}</strong></div>
          </div>
          <div className="cs-card-detail"><BriefcaseBusiness size={15} /><span>{selected.current_department || selected.posting_location || "Posting details unavailable"}</span></div>
          <div className="cs-card-detail"><ShieldCheck size={15} /><span>{selected.source_name || "Source not listed"}{selected.source_snapshot_date ? " · " + new Date(selected.source_snapshot_date).toLocaleDateString("en-IN") : ""}</span></div>
        </aside>
      )}
    </div>
  );
}
