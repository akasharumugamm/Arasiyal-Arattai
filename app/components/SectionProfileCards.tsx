"use client";

import {
  Award, BadgeCheck, BarChart3, BriefcaseBusiness, CalendarDays, GraduationCap,
  Landmark, MapPin, ShieldCheck, TrendingDown, TrendingUp, Users, Vote,
} from "lucide-react";

type SelectedProfile = {
  label: string;
  role: string;
  description?: string;
  photoUrl?: string;
  mlaParty?: string;
  mlaNumber?: number;
  mlaEmail?: string;
};

function DemoNotice() {
  return <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.12em] text-amber-800">Prototype · Sample figures · Replace with verified database data</div>;
}

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return <div className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-inset ring-zinc-950/[.04]"><div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">{label}</div><div className="mt-1 text-lg font-extrabold tracking-tight text-zinc-900">{value}</div>{note && <div className="mt-1 text-[10px] leading-snug text-zinc-400">{note}</div>}</div>;
}

export function ElectionResultsDashboard() {
  const parties = [{ name: "TVK+", seats: 118, color: "#fbbf24" }, { name: "DMK", seats: 60, color: "#ef4444" }, { name: "AIADMK", seats: 46, color: "#34d399" }, { name: "Others", seats: 5, color: "#fb923c" }, { name: "Vacant", seats: 5, color: "#71717a" }];
  return <section className="overflow-hidden rounded-[24px] bg-white shadow-xl ring-1 ring-zinc-950/5">
    <DemoNotice />
    <div className="relative overflow-hidden bg-zinc-950 px-5 py-6 text-white">
      <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-amber-500/20 blur-3xl" />
      <p className="relative text-[9px] font-bold uppercase tracking-[.22em] text-zinc-400">TN Assembly · 2026</p>
      <h2 className="relative mt-3 text-xl font-bold leading-snug">Tamil Nadu Assembly <span className="font-serif font-medium italic text-amber-300">at a glance</span></h2>
      <p className="relative mt-2 text-[11px] leading-relaxed text-zinc-400">A sample election-results summary. Figures are placeholders pending verification and database integration.</p>
      <div className="mt-5 rounded-2xl bg-white/[.06] p-4 ring-1 ring-inset ring-white/10">
        <div className="text-center text-[9px] font-bold uppercase tracking-[.2em] text-zinc-400">Assembly composition · sample</div>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-white/10">{parties.map(p => <span key={p.name} style={{ width: (p.seats/234*100)+"%", background:p.color }} />)}</div>
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">{parties.map(p => <div key={p.name} className="flex items-center justify-between gap-2 text-[10px]"><span className="flex items-center gap-1.5 text-zinc-400"><i className="h-2 w-2 rounded-full" style={{background:p.color}} />{p.name}</span><b className="text-white">{p.seats}</b></div>)}</div>
        <div className="mt-4 border-t border-white/10 pt-3 text-center"><strong className="text-3xl">234</strong><div className="text-[9px] tracking-[.2em] text-zinc-500">TOTAL SEATS</div></div>
      </div>
    </div>
    <div className="space-y-5 p-4">
      <div><h3 className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-zinc-500"><Landmark size={14}/> Assembly snapshot</h3><div className="grid grid-cols-2 gap-2"><Tile label="Sitting MLAs" value="229 / 234"/><Tile label="Vacant seats" value="5"/><Tile label="Majority mark" value="118"/><Tile label="House status" value="Hung"/></div></div>
      <div><h3 className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-zinc-500"><BarChart3 size={14}/> Voter statistics</h3><div className="grid grid-cols-2 gap-2"><Tile label="Turnout" value="85.1%" note="Sample figure"/><Tile label="Electors" value="5.73 Cr"/><Tile label="Votes polled" value="4.88 Cr"/><Tile label="Candidates" value="4,023"/></div></div>
    </div>
    <p className="border-t border-zinc-100 bg-zinc-50 px-4 py-3 text-center text-[9px] leading-relaxed text-zinc-500">Reference design supplied for Arasiyal Arattai. Confirm every result with the Election Commission before publication.</p>
  </section>;
}

export function PoliticianProfileCard({ profile }: { profile: SelectedProfile }) {
  const isVijay = /vijay/i.test(profile.label);
  return <section className="overflow-hidden rounded-[24px] bg-white shadow-xl ring-1 ring-zinc-950/5">
    <DemoNotice />
    <div className="relative bg-zinc-950 px-5 py-6 text-white">
      <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-blue-600/25 blur-3xl"/>
      <p className="text-[9px] font-bold uppercase tracking-[.2em] text-zinc-500">Selected profile</p>
      <div className="mt-4 flex items-center gap-3">
        {profile.photoUrl ? <img src={profile.photoUrl} alt={profile.label} className="h-[68px] w-[68px] rounded-[19px] object-cover ring-2 ring-white/15"/> : <div className="grid h-[68px] w-[68px] place-items-center rounded-[19px] bg-blue-500/20 text-xl font-bold">{profile.label.slice(0,1)}</div>}
        <div className="min-w-0"><h2 className="text-base font-bold leading-tight">{profile.label}</h2><p className="mt-1 text-[11px] text-zinc-400">{profile.role}</p><div className="mt-2 flex flex-wrap gap-1.5"><span className="rounded-full bg-blue-400/15 px-2 py-1 text-[9px] text-blue-200">{profile.mlaParty || "TVK"}</span><span className="rounded-full bg-white/10 px-2 py-1 text-[9px] text-zinc-300">Assembly profile</span></div></div>
      </div>
      <div className="mt-5 rounded-2xl bg-white/[.06] p-3 ring-1 ring-inset ring-white/10"><div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-400"><span>Public sentiment</span><span className="text-amber-300">Sample score</span></div><div className="mt-2 flex items-baseline gap-1"><strong className="text-4xl">67</strong><span className="text-xs text-zinc-500">/ 100</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[67%] rounded-full bg-gradient-to-r from-amber-400 to-orange-500"/></div></div>
    </div>
    <div className="space-y-4 p-4">
      <div><h3 className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-zinc-500"><Award size={14}/> Election profile</h3><div className="grid grid-cols-2 gap-2"><Tile label="Votes won" value={isVijay ? "1,20,365" : "—"}/><Tile label="Vote share" value={isVijay ? "58.9%" : "—"}/><Tile label="Margin" value={isVijay ? "53,715" : "—"}/><Tile label="Constituency" value={isVijay ? "Perambur" : "See directory"}/></div></div>
      <div><h3 className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-zinc-500"><BriefcaseBusiness size={14}/> Public declarations</h3><div className="grid grid-cols-2 gap-2"><Tile label="Assets" value={isVijay ? "₹648.86 cr" : "—"}/><Tile label="Liabilities" value={isVijay ? "₹7.64 cr" : "—"}/><Tile label="Pending cases" value={isVijay ? "2" : "—"}/><Tile label="Education" value={isVijay ? "12th Pass" : "—"}/></div></div>
      <p className="text-[9px] leading-relaxed text-zinc-500">Profile identity follows the selected directory entry. Detailed election and affidavit figures are prototype content and must be verified before publication.</p>
    </div>
  </section>;
}

export function IPSOfficerProfileCard({ profile }: { profile: SelectedProfile }) {
  const isAmalraj = /amalraj/i.test(profile.label);
  return <section className="overflow-hidden rounded-[24px] bg-white shadow-xl ring-1 ring-zinc-950/5">
    <DemoNotice />
    <div className="relative bg-zinc-950 px-5 py-6 text-white">
      <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-blue-600/25 blur-3xl"/>
      <p className="text-[9px] font-bold uppercase tracking-[.2em] text-zinc-500">Civil services profile</p>
      <div className="mt-4 flex items-center gap-3">
        {profile.photoUrl ? <img src={profile.photoUrl} alt={profile.label} className="h-[68px] w-[68px] rounded-[19px] object-cover ring-2 ring-white/15"/> : <div className="grid h-[68px] w-[68px] place-items-center rounded-[19px] bg-blue-500/20 text-xl font-bold">{profile.label.slice(0,1)}</div>}
        <div className="min-w-0"><h2 className="text-base font-bold">{profile.label}</h2><p className="mt-1 text-[11px] text-zinc-400">{profile.role}</p><span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] text-emerald-300"><ShieldCheck size={11}/> Officer record</span></div>
      </div>
      <div className="mt-5 rounded-2xl bg-white/[.06] p-3 ring-1 ring-inset ring-white/10"><div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Public sentiment · sample</div><div className="mt-2 flex items-baseline gap-1"><strong className="text-4xl">67</strong><span className="text-xs text-zinc-500">/ 100</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[67%] rounded-full bg-gradient-to-r from-amber-400 to-orange-500"/></div></div>
    </div>
    <div className="space-y-4 p-4">
      <div><h3 className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-zinc-500"><CalendarDays size={14}/> Service record</h3><div className="grid grid-cols-2 gap-2"><Tile label="Batch" value={isAmalraj ? "1996" : "—"}/><Tile label="Service" value={isAmalraj ? "30 yrs" : "—"}/><Tile label="Cadre" value="Tamil Nadu"/><Tile label="Entry" value="UPSC · RR"/></div></div>
      <div><h3 className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-zinc-500"><ShieldCheck size={14}/> Posting</h3><Tile label="Current designation" value={profile.role || "Not available"}/></div>
      <div><h3 className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-zinc-500"><GraduationCap size={14}/> Recognition</h3><Tile label="Honours" value={isAmalraj ? "2 medals" : "Not supplied"} note="Sample data; verify against official records."/></div>
      <p className="text-[9px] leading-relaxed text-zinc-500">Officer identity is selected from the directory. Posting, service and honours data are placeholders until connected to the civil-list database.</p>
    </div>
  </section>;
}

export function DirectoryPanel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-blue-600">Arasiyal Arattai directory</p><h2 className="mt-1 text-xl font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>{children}</section>;
}
