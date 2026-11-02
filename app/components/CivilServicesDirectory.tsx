"use client";

import "./CivilServicesDirectory.css";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw, ShieldCheck, BriefcaseBusiness, MapPin, ExternalLink, Users, GraduationCap } from "lucide-react";

type Officer = {
  id: number; full_name: string; service_type: "IAS" | "IPS"; batch_year: number | null;
  cadre: string | null; employee_id: string; current_designation: string | null;
  current_department: string | null; posting_location: string | null; recruitment_type: string | null;
  education: string | null; pay_level: string | null; source_name: string | null;
  source_snapshot_date: string | null; verification_status: string | null;
};

export default function CivilServicesDirectory() {
  const [service,setService]=useState<"IAS"|"IPS">("IPS");
  const [query,setQuery]=useState("");
  const [cadre,setCadre]=useState("Tamil Nadu");
  const [pay,setPay]=useState("All Pay Levels");
  const [source,setSource]=useState("All Sources");
  const [batchFrom,setBatchFrom]=useState("");
  const [batchTo,setBatchTo]=useState("");
  const [senior,setSenior]=useState(false);
  const [officers,setOfficers]=useState<Officer[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [sort,setSort]=useState<{key:"full_name"|"batch_year"|"pay_level";dir:"asc"|"desc"}>({key:"batch_year",dir:"asc"});
  const [selected,setSelected]=useState<Officer|null>(null);

  useEffect(()=>{
    const controller=new AbortController();
    const timer=window.setTimeout(async()=>{
      setLoading(true); setError("");
      const params=new URLSearchParams({service,q:query,cadre:cadre==="All Cadres"?"All Cadres":cadre,pay:pay==="All Pay Levels"?"":pay,source:source==="All Sources"?"":source,batchFrom,batchTo,senior:String(senior)});
      try {
        const response=await fetch("/api/civil-services?"+params.toString(),{cache:"no-store",signal:controller.signal});
        const data=await response.json();
        if(!response.ok) throw new Error(data.error||"Could not load officers");
        setOfficers(Array.isArray(data.officers)?data.officers:[]);
      } catch(e) { if(!controller.signal.aborted) setError(e instanceof Error?e.message:"Unable to load officers"); }
      finally { if(!controller.signal.aborted) setLoading(false); }
    },220);
    return ()=>{controller.abort();window.clearTimeout(timer);};
  },[service,query,cadre,pay,source,batchFrom,batchTo,senior]);

  const sorted=useMemo(()=>[...officers].sort((a,b)=>{
    const av=a[sort.key]??"", bv=b[sort.key]??"";
    const cmp=String(av).localeCompare(String(bv),undefined,{numeric:true,sensitivity:"base"});
    return sort.dir==="asc"?cmp:-cmp;
  }),[officers,sort]);
  const sources=useMemo(()=>["All Sources",...Array.from(new Set(officers.map(o=>o.source_name).filter(Boolean) as string[])).sort()], [officers]);
  const pays=useMemo(()=>["All Pay Levels",...Array.from(new Set(officers.map(o=>o.pay_level).filter(Boolean) as string[])).sort()], [officers]);
  const reset=()=>{setQuery("");setCadre("Tamil Nadu");setPay("All Pay Levels");setSource("All Sources");setBatchFrom("");setBatchTo("");setSenior(false);};
  const changeSort=(key:"full_name"|"batch_year"|"pay_level")=>setSort(s=>({key,dir:s.key===key&&s.dir==="asc"?"desc":"asc"}));
  const initials=(name:string)=>name.split(/\s+/).slice(0,2).map(p=>p[0]).join("").toUpperCase();

  return <div className="cs-directory">
    <section className="cs-workspace">
      <div className="cs-toolbar">
        <label className="cs-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={service==="IPS"?"Search officer name, IPS ID, designation or posting…":"Search officer name, IAS ID, designation or posting…"}/>{query&&<button onClick={()=>setQuery("")} aria-label="Clear search">×</button>}</label>
        <div className="cs-filter-row">
          <div className="cs-service-tabs cs-service-tabs-inline" role="tablist" aria-label="Civil service">
            {(["IAS","IPS"] as const).map(s=><button key={s} role="tab" aria-selected={service===s} className={service===s?"active":""} onClick={()=>{setService(s);setSelected(null);}}><span>{s}</span><small>{s==="IAS"?"Administrative Service":"Police Service"}</small></button>)}
          </div>
          <label className="cs-filter cs-cadre"><MapPin size={14}/><select value={cadre} onChange={e=>setCadre(e.target.value)}><option>Tamil Nadu</option><option>All Cadres</option></select></label>
          <label className="cs-filter"><select value={source} onChange={e=>setSource(e.target.value)}>{sources.map(s=><option key={s}>{s}</option>)}</select></label>
          <label className="cs-filter"><select value={pay} onChange={e=>setPay(e.target.value)}>{pays.map(p=><option key={p}>{p}</option>)}</select></label>
          <label className="cs-filter cs-year"><span>Batch from</span><input type="number" min="1950" max="2100" placeholder="Year" value={batchFrom} onChange={e=>setBatchFrom(e.target.value)}/></label>
          <label className="cs-filter cs-year"><span>Batch to</span><input type="number" min="1950" max="2100" placeholder="Year" value={batchTo} onChange={e=>setBatchTo(e.target.value)}/></label>
          <button className={senior?"cs-toggle selected":"cs-toggle"} onClick={()=>setSenior(v=>!v)}><GraduationCap size={14}/> Senior (25+ yrs)</button>
          <button className="cs-reset" onClick={reset}><RotateCcw size={14}/> Clear filters</button>
        </div>
      </div>
      <div className="cs-table-head"><div><span className="cs-live-dot"/> OFFICER DIRECTORY <span className="cs-count">{officers.length.toLocaleString("en-IN")} records</span></div><span><ShieldCheck size={14}/> Source-backed records</span></div>
      <div className="cs-table-wrap">
        <table className="cs-table">
          <thead><tr><th>#</th><th>Officer</th><th>Current role / posting</th><th>Cadre</th><th><button onClick={()=>changeSort("batch_year")}>Batch <ArrowUpDown size={13}/></button></th><th>Source</th><th><button onClick={()=>changeSort("pay_level")}>Pay <ArrowUpDown size={13}/></button></th><th>Service</th></tr></thead>
          <tbody>
            {loading&&<tr><td colSpan={8} className="cs-state">Loading officer records…</td></tr>}
            {!loading&&error&&<tr><td colSpan={8} className="cs-state cs-error">{error}</td></tr>}
            {!loading&&!error&&sorted.length===0&&<tr><td colSpan={8} className="cs-state">No officers match these filters. Try clearing some filters.</td></tr>}
            {!loading&&!error&&sorted.map((o,i)=>{
              const years=o.batch_year?Math.max(0,new Date().getFullYear()-o.batch_year):null;
              return <tr key={o.id} className={selected?.id===o.id?"is-selected":""} onClick={()=>setSelected(o)}>
                <td className="cs-index">{i+1}</td>
                <td><div className="cs-officer"><span className="cs-avatar">{initials(o.full_name)}</span><span className="cs-officer-text"><strong>{o.full_name}</strong><small>{o.employee_id}</small></span></div></td>
                <td><div className="cs-role">{o.current_designation||"Posting not listed"}</div>{o.current_department&&<small className="cs-subline">{o.current_department}</small>}{o.posting_location&&<small className="cs-subline">{o.posting_location}</small>}</td>
                <td><strong className="cs-cadre-name">{o.cadre||"—"}</strong></td>
                <td className="cs-number">{o.batch_year||"—"}</td>
                <td><span className="cs-source">{o.recruitment_type||o.source_name||"—"}</span></td>
                <td className="cs-number">{o.pay_level||"—"}</td>
                <td className="cs-years">{years===null?"—":years+"y"}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      <footer className="cs-table-footer"><span>Showing {sorted.length.toLocaleString("en-IN")} of available {service} records</span><span>Officer details are based on the available source snapshot.</span></footer>
    </section>
    {selected&&<aside className="cs-selected-card">
      <button className="cs-close" onClick={()=>setSelected(null)} aria-label="Close officer details">×</button>
      <div className="cs-card-kicker">{selected.service_type} · OFFICER PROFILE</div><div className="cs-card-avatar">{initials(selected.full_name)}</div>
      <h2>{selected.full_name}</h2><p>{selected.current_designation||"Designation not listed"}</p>
      <div className="cs-card-grid"><div><small>Cadre</small><strong>{selected.cadre||"—"}</strong></div><div><small>Batch</small><strong>{selected.batch_year||"—"}</strong></div><div><small>Employee ID</small><strong>{selected.employee_id}</strong></div><div><small>Pay level</small><strong>{selected.pay_level||"—"}</strong></div></div>
      <div className="cs-card-detail"><BriefcaseBusiness size={15}/><span>{selected.current_department||selected.posting_location||"Posting details unavailable"}</span></div>
      <div className="cs-card-detail"><ShieldCheck size={15}/><span>{selected.source_name||"Source not listed"}{selected.source_snapshot_date?" · "+new Date(selected.source_snapshot_date).toLocaleDateString("en-IN"):""}</span></div>
    </aside>}
  </div>;
}
