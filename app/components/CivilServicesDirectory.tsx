"use client";

import "./CivilServicesDirectory.css";

import { useEffect, useMemo, useState } from "react";
import { Search, Shield, Landmark, ArrowUpDown, SearchX, BadgeCheck, X, ChevronRight, BriefcaseBusiness, ShieldCheck } from "lucide-react";

export type CivilServiceOfficer = {
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

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();

type CivilServicesDirectoryProps = {
  onSelectOfficer?: (officer: CivilServiceOfficer | null) => void;
  selectedOfficerId?: number | null;
};

export default function CivilServicesDirectory({ onSelectOfficer, selectedOfficerId }: CivilServicesDirectoryProps = {}) {
  const [service, setService] = useState<"IPS" | "IAS">("IPS");
  const [query, setQuery] = useState("");
  const [seniorFirst, setSeniorFirst] = useState(true);
  const [officers, setOfficers] = useState<CivilServiceOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [localSelected, setLocalSelected] = useState<CivilServiceOfficer | null>(null);
  const activeSelectedOfficerId = onSelectOfficer ? (selectedOfficerId ?? null) : (localSelected?.id ?? null);
  const selectOfficer = (officer: CivilServiceOfficer | null) => {
    setLocalSelected(officer);
    onSelectOfficer?.(officer);
  };

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
                <button key={s} type="button" role="tab" aria-selected={service === s} onClick={() => { setService(s); selectOfficer(null); }} className={service === s ? "active" : ""}>
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
            <button type="button" key={officer.id} className={`cs-reference-row${activeSelectedOfficerId === officer.id ? " selected" : ""}`} onClick={() => selectOfficer(officer)}>
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
      {!onSelectOfficer && localSelected && (
        <CivilServicesProfileCard officer={localSelected} onClose={() => selectOfficer(null)} />
      )}
    </div>
  );
}


export function CivilServicesProfileCard({
  officer,
  onClose,
}: {
  officer: CivilServiceOfficer;
  onClose: () => void;
}) {
  const currentYear = new Date().getFullYear();
  const serviceYears = officer.batch_year
    ? Math.max(0, currentYear - officer.batch_year)
    : null;
  const sourceDate = officer.source_snapshot_date
    ? new Date(officer.source_snapshot_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;
  const posting = [officer.current_designation, officer.current_department, officer.posting_location]
    .filter(Boolean)
    .join(" · ");
  const statusLabel = officer.verification_status?.trim() || "Officer record";
  const sourceLabel = officer.source_name?.trim() || "Source not listed";
  const initialsText = initials(officer.full_name) || "TN";

  return (
    <aside className="relative w-full overflow-hidden rounded-[28px] bg-white text-zinc-900 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18)] ring-1 ring-zinc-950/5">
      {/* === HERO (DARK) === */}
      <div className="relative overflow-hidden bg-zinc-950 px-5 pb-6 pt-5">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
              {officer.service_type} Officer Profile
            </h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex max-w-[128px] items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[9px] font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/25">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span className="truncate">{statusLabel}</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close officer profile"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-zinc-300 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Identity */}
          <div className="mt-5 flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div aria-hidden className="absolute -inset-[3px] rounded-[24px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-sky-400" />
              <div
                aria-label={officer.full_name}
                className="relative flex h-20 w-20 items-center justify-center rounded-[22px] bg-zinc-800 text-2xl font-bold text-white ring-4 ring-zinc-950"
              >
                {initialsText}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 ring-4 ring-zinc-950">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="break-words text-lg font-bold tracking-tight text-white">
                {officer.full_name}
              </h2>
              <p className="mt-0.5 text-xs font-medium leading-snug text-zinc-400">
                {officer.current_designation || "Designation not listed"}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <GlassChip>{officer.cadre || "Cadre not listed"}</GlassChip>
                <GlassChip accent>{officer.batch_year ? officer.batch_year + " Batch" : "Batch not listed"}</GlassChip>
                <GlassChip>{officer.recruitment_type || "Entry not listed"}</GlassChip>
              </div>
            </div>
          </div>

          {/* Public Sentiment */}
          <div className="mt-6 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10 backdrop-blur-xl">
            <div className="mb-3.5 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                Public Sentiment
              </span>
              <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[9px] font-semibold text-amber-300 ring-1 ring-inset ring-amber-400/25">
                Awaiting review data
              </span>
            </div>
            <div className="flex items-end justify-between gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold leading-none tracking-tighter text-white tabular-nums">—</span>
                <span className="text-sm font-medium text-zinc-500">/ 100</span>
              </div>
              <span className="text-right text-[10px] font-semibold text-zinc-400">
                No verified score yet
              </span>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10" />
            <div className="mt-2 flex justify-between text-[9px] font-medium text-zinc-500 tabular-nums">
              <span>0</span><span>50</span><span>100</span>
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-zinc-500">
              A public sentiment score will appear when review data for this officer is available.
            </p>
          </div>
        </div>
      </div>

      {/* === BODY === */}
      <div className="space-y-6 p-5">
        {/* Current Posting */}
        <ProfileSection title="Current Posting" icon={<Shield className="h-3.5 w-3.5" />}>
          <div className="col-span-2 rounded-2xl bg-blue-50/70 p-4 ring-1 ring-inset ring-blue-900/5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Shield className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="text-sm font-bold leading-snug text-zinc-900">
                    {posting || "Current posting not listed"}
                  </div>
                  {officer.pay_level && (
                    <span className="shrink-0 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10">
                      {officer.pay_level}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[11px] font-medium text-zinc-500">
                  {sourceDate ? "Officer record snapshot · " + sourceDate : "Posting date not provided in this record"}
                </div>
              </div>
            </div>
            <div className="mt-4 border-t border-blue-900/10 pt-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold text-zinc-500">Posting location</span>
                <span className="text-right text-xs font-bold text-zinc-900">
                  {officer.posting_location || "Not listed"}
                </span>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">
                Current designation and posting details are shown from the available officer record.
              </p>
            </div>
          </div>
        </ProfileSection>

        {/* Service Record */}
        <ProfileSection title="Service Record" icon={<Shield className="h-3.5 w-3.5" />}>
          <ProfileStatTile
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="Batch"
            value={officer.batch_year?.toString() || "Not listed"}
            sub={officer.batch_year ? "Batch year " + officer.batch_year : "Joining date not listed"}
            theme="blue"
          />
          <ProfileStatTile
            icon={<Timer className="h-3.5 w-3.5" />}
            label="Service"
            value={serviceYears === null ? "Not listed" : "~" + serviceYears + " yrs"}
            sub={serviceYears === null ? "Batch year unavailable" : officer.batch_year + " — present (approx.)"}
            theme="emerald"
          />
          <ProfileStatTile
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Cadre"
            value={officer.cadre || "Not listed"}
            sub="Cadre in officer record"
            theme="orange"
          />
          <ProfileStatTile
            icon={<UserCheck className="h-3.5 w-3.5" />}
            label="Entry"
            value={officer.recruitment_type || "Not listed"}
            sub="Recruitment type"
            theme="violet"
          />
        </ProfileSection>

        {/* Honours & Education */}
        <ProfileSection title="Honours & Education" icon={<Award className="h-3.5 w-3.5" />}>
          <div className="relative col-span-2 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 p-5 text-white">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100">
                    Decorations
                  </div>
                  <div className="mt-1.5 text-2xl font-bold leading-none tracking-tight">
                    Not listed
                  </div>
                  <p className="mt-2 text-[10px] leading-relaxed text-amber-100/80">
                    Decoration details are not present in the current officer record.
                  </p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-inset ring-white/20">
                  <Medal className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 ring-1 ring-inset ring-white/15">
                <Star className="h-3.5 w-3.5 shrink-0 text-amber-200" />
                <span className="text-[11px] font-semibold leading-snug">
                  No verified awards are available in this dataset.
                </span>
              </div>
            </div>
          </div>

          <ProfileStatTile
            icon={<GraduationCap className="h-3.5 w-3.5" />}
            label="Education"
            value={officer.education || "Not listed"}
            sub="Education record"
            theme="violet"
          />
          <ProfileStatTile
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            label={officer.service_type + " ID"}
            value={officer.employee_id || "Not listed"}
            sub={sourceLabel}
            theme="blue"
          />
        </ProfileSection>
      </div>

      {/* === FOOTER === */}
      <div className="border-t border-zinc-100 bg-zinc-50/80 px-5 py-3.5">
        <p className="text-center text-[10px] leading-relaxed text-zinc-500">
          <span className="font-semibold text-zinc-700">Source:</span> {sourceLabel}.
          {sourceDate ? " Snapshot: " + sourceDate + "." : " Source snapshot date not listed."}
        </p>
      </div>
    </aside>
  );
}

function GlassChip({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <span className={"inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[9px] font-semibold ring-1 ring-inset " + (
      accent
        ? "bg-blue-400/15 text-blue-300 ring-blue-400/25"
        : "bg-white/[0.07] text-zinc-300 ring-white/10"
    )}>
      <span className="truncate">{children}</span>
    </span>
  );
}

function ProfileSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 px-0.5">
        <span className="text-zinc-400">{icon}</span>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          {title}
        </h2>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {children}
      </div>
    </section>
  );
}

function ProfileStatTile({
  icon,
  label,
  value,
  sub,
  theme,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  theme: "emerald" | "violet" | "orange" | "blue";
}) {
  const themes = {
    emerald: "bg-emerald-500/10 text-emerald-600",
    violet: "bg-violet-500/10 text-violet-600",
    orange: "bg-orange-500/10 text-orange-600",
    blue: "bg-blue-500/10 text-blue-600",
  };

  return (
    <div className="group min-w-0 rounded-2xl bg-zinc-50/70 p-4 ring-1 ring-inset ring-zinc-950/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-zinc-900/[0.06] hover:ring-zinc-950/10">
      <div className={"mb-3 flex h-9 w-9 items-center justify-center rounded-xl " + themes[theme]}>
        {icon}
      </div>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </div>
      <div className="break-words text-base font-bold leading-tight tracking-tight text-zinc-900 tabular-nums">
        {value}
      </div>
      {sub && (
        <div className="mt-1.5 text-[10px] font-medium leading-snug text-zinc-400">
          {sub}
        </div>
      )}
    </div>
  );
}
