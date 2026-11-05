"use client";

import "./CivilServicesDirectory.css";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Search, Shield, Landmark, ArrowUpDown, SearchX, X, ChevronRight, ShieldCheck, Medal, Award, GraduationCap, CalendarDays, Timer, MapPin, UserCheck, Star } from "lucide-react";

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
  date_of_birth: string | null;
  posting_effective_date: string | null;
  source_specific_data: Record<string, unknown> | null;
};

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();

const sourceText = (source: Record<string, unknown> | null | undefined, key: string): string | null => {
  const value = source?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

const parseSourceDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const dmy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const date = dmy
    ? new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatSourceDate = (value: string | null | undefined): string | null => {
  const date = parseSourceDate(value);
  return date
    ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : null;
};

const completedServiceYears = (start: Date, end = new Date()): number => {
  let years = end.getFullYear() - start.getFullYear();
  const beforeAnniversary =
    end.getMonth() < start.getMonth() ||
    (end.getMonth() === start.getMonth() && end.getDate() < start.getDate());
  if (beforeAnniversary) years -= 1;
  return Math.max(0, years);
};

const EXPECTED_SERVICE_TENURE_YEARS = 33;
const OFFICER_PAGE_SIZE = 20;



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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [localSelected, setLocalSelected] = useState<CivilServiceOfficer | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const loadMoreControllerRef = useRef<AbortController | null>(null);
  const activeSelectedOfficerId = onSelectOfficer ? (selectedOfficerId ?? null) : (localSelected?.id ?? null);
  const selectOfficer = (officer: CivilServiceOfficer | null) => {
    setLocalSelected(officer);
    onSelectOfficer?.(officer);
  };

  const loadPage = useCallback(async (offset: number, signal: AbortSignal) => {
    const params = new URLSearchParams({
      service,
      q: query,
      cadre: "Tamil Nadu",
      senior: String(seniorFirst),
      limit: String(OFFICER_PAGE_SIZE),
      offset: String(offset),
    });
    const response = await fetch("/api/civil-services?" + params.toString(), { cache: "no-store", signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load officers");
    return {
      officers: Array.isArray(data.officers) ? data.officers as CivilServiceOfficer[] : [],
      hasMore: data.hasMore === true,
    };
  }, [query, seniorFirst, service]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const page = await loadPage(0, controller.signal);
        setOfficers(page.officers);
        setHasMore(page.hasMore);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Unable to load officers");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => {
      controller.abort();
      loadMoreControllerRef.current?.abort();
      loadMoreControllerRef.current = null;
      setLoadingMore(false);
      window.clearTimeout(timer);
    };
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError("");
    const controller = new AbortController();
    loadMoreControllerRef.current = controller;
    try {
      const page = await loadPage(officers.length, controller.signal);
      setOfficers(current => [...current, ...page.officers]);
      setHasMore(page.hasMore);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unable to load more officers");
    } finally {
      if (loadMoreControllerRef.current === controller) {
        loadMoreControllerRef.current = null;
        setLoadingMore(false);
      }
    }
  }, [hasMore, loadPage, loading, loadingMore, officers.length]);

  const handleListScroll = () => {
    const list = listRef.current;
    if (list && list.scrollTop + list.clientHeight >= list.scrollHeight - 80) {
      void loadMore();
    }
  };

  const filtered = useMemo(() => [...officers].sort((a, b) => {
    const aYear = a.batch_year ?? parseSourceDate(sourceText(a.source_specific_data, "date_of_appointment_to_ips"))?.getFullYear() ?? null;
    const bYear = b.batch_year ?? parseSourceDate(sourceText(b.source_specific_data, "date_of_appointment_to_ips"))?.getFullYear() ?? null;
    const left = aYear ?? (seniorFirst ? 9999 : 0);
    const right = bYear ?? (seniorFirst ? 9999 : 0);
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

        <div ref={listRef} className="cs-reference-list" onScroll={handleListScroll}>
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
              <span className="cs-reference-rank">{String(index + 1).padStart(2, "0")}</span>
              <span className="cs-reference-officer">
                <span className="cs-reference-avatar">{initials(officer.full_name)}</span>
                <span className="cs-reference-officer-copy">
                  <strong>{officer.full_name}</strong>
                  <small>{officer.employee_id} · {officer.batch_year ?? (parseSourceDate(sourceText(officer.source_specific_data, "date_of_appointment_to_ips"))?.getFullYear() ?? "Batch not listed")} Batch</small>
                  <small className="cs-reference-mobile-role">{officer.current_designation || "Role not listed"}</small>
                </span>
              </span>
              <span className="cs-reference-role">
                <strong>{officer.current_designation || "Role not listed"}</strong>
                <small>{[officer.current_department, officer.posting_location].filter(Boolean).join(" · ")}</small>
              </span>
              <span className="cs-reference-cadre">
                <strong>{officer.cadre || "—"}</strong>
                <small>{sourceText(officer.source_specific_data, "home_state") || sourceText(officer.source_specific_data, "home_state_or_domicile") || "—"}</small>
              </span>
              <ChevronRight className="cs-reference-chevron" size={16} />
            </button>
          ))}
          {!loading && !error && loadingMore && <div className="cs-reference-state">Loading more officer records…</div>}
        </div>

        <footer className="cs-reference-footer">
          <p>Showing <strong>{filtered.length}</strong> loaded {service} officers{hasMore ? " · Scroll to load more" : ""}</p>
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
  const source = officer.source_specific_data ?? {};
  const appointmentDateRaw = sourceText(source, "date_of_appointment_to_ips");
  const appointmentDate = parseSourceDate(appointmentDateRaw);
  const displayBatchYear = officer.batch_year ?? appointmentDate?.getFullYear() ?? null;
  const serviceYears = appointmentDate
    ? completedServiceYears(appointmentDate)
    : displayBatchYear
      ? Math.max(0, new Date().getFullYear() - displayBatchYear)
      : null;
  const serviceProgress = serviceYears === null
    ? 0
    : Math.min(100, Math.round((serviceYears / EXPECTED_SERVICE_TENURE_YEARS) * 100));
  const currentYear = new Date().getFullYear();

  const sourceSnapshotDate = formatSourceDate(officer.source_snapshot_date);
  const presentPostDate = formatSourceDate(
    officer.posting_effective_date || sourceText(source, "date_of_appointment_to_present_post")
  );
  const sourceLabel = officer.source_name?.trim() || sourceText(source, "source_document") || "Source not listed";
  const statusLabel = officer.verification_status?.trim() || "Officer record";
  const cadre = officer.cadre || sourceText(source, "cadre");
  const recruitment = officer.recruitment_type || sourceText(source, "recruitment_source");
  const education = officer.education || sourceText(source, "educational_qualification");
  const payLevel = officer.pay_level || sourceText(source, "pay_level");
  const presentPost = officer.current_designation || sourceText(source, "present_post_held");
  const commissioneratePosting = presentPost?.match(/^Addl\.?\s*DGP,\s*CP,\s*(.+)$/i);
  const postingTitle = commissioneratePosting
    ? "Addl. DGP, CP — " + commissioneratePosting[1]
    : [presentPost, officer.current_department, officer.posting_location].filter(Boolean).join(" · ");
  const postingRank = presentPost && /^Addl\.?\s*DGP/i.test(presentPost)
    ? "ADGP rank"
    : presentPost && /\b(DGP|IGP|DIG|SP|SSP|ASP|DSP)\b/i.test(presentPost)
      ? (presentPost.match(/\b(DGP|IGP|DIG|SP|SSP|ASP|DSP)\b/i)?.[1].toUpperCase() ?? null) + " rank"
      : null;
  const initialsText = initials(officer.full_name) || "TN";

  const medalSource = sourceText(source, "police_medals");
  const medalTitles: Record<string, string> = {
    PPMDS: "President’s Police Medal for Distinguished Service",
    PPM: "President’s Police Medal for Distinguished Service",
    PPDS: "President’s Police Medal for Distinguished Service",
    PMMS: "Police Medal for Meritorious Service",
    PPMG: "President’s Police Medal for Gallantry",
    PMG: "Police Medal for Gallantry",
    PSM: "President’s Medal for Distinguished Service",
    MSM: "Medal for Meritorious Service",
  };
  const medals: { code: string; name: string; year: string; index: number }[] = [];
  if (medalSource) {
    // Parse each code/year pair exactly once. The generic alternative handles
    // source abbreviations not yet mapped to a verified full award title.
    const medalPattern = /\b(UN\s+peace\s+keeping\s+Medal|PPMDS|PPM|PPDS|PMMS|PPMG|PMG|PSM|MSM|[A-Z][A-Z0-9]*)\s*-\s*(\d{4})\b/gi;
    for (const match of medalSource.matchAll(medalPattern)) {
      const code = match[1].toUpperCase().replace(/\s+/g, " ");
      const isUnitedNationsMedal = code === "UN PEACE KEEPING MEDAL";
      const normalizedCode = isUnitedNationsMedal ? "UN" : code;
      medals.push({
        code: normalizedCode,
        name: isUnitedNationsMedal
          ? "United Nations Peacekeeping Medal"
          : medalTitles[normalizedCode] || normalizedCode,
        year: match[2],
        index: match.index ?? 0,
      });
    }
  }

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
                {presentPost || "Designation not listed"}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <GlassChip>{cadre || "Cadre not listed"}</GlassChip>
                <GlassChip accent>{displayBatchYear ? displayBatchYear + " Batch" : "Batch not listed"}</GlassChip>
                <GlassChip>{recruitment || "Entry not listed"}</GlassChip>
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
          <div className="col-span-2 rounded-2xl border border-blue-100 bg-[#f3f7ff] p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Shield className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 text-[14px] font-bold leading-[1.3] text-zinc-900">
                    {postingTitle || "Current posting not listed"}
                  </div>
                  {payLevel && (
                    <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-[10px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                      {payLevel}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 text-[11px] font-medium text-zinc-500">
                  {postingRank && <span>{postingRank}</span>}
                  {postingRank && presentPostDate && <span> · </span>}
                  {presentPostDate ? "since " + presentPostDate : !postingRank ? "Posting effective date not listed" : ""}
                </div>
              </div>
            </div>
            <div className="mt-4 border-t border-blue-100 pt-3.5">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[10px] font-semibold text-zinc-600">Service tenure</span>
                <span className="text-xs font-bold text-zinc-900 tabular-nums">
                  {serviceYears === null ? "Not available" : serviceYears + " years"}
                </span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-label="Completed service tenure"
                aria-valuemin={0}
                aria-valuemax={EXPECTED_SERVICE_TENURE_YEARS}
                aria-valuenow={Math.min(serviceYears ?? 0, EXPECTED_SERVICE_TENURE_YEARS)}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-[width] duration-500"
                  style={{ width: serviceYears === null ? "0%" : serviceProgress + "%" }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[9px] font-medium text-slate-400 tabular-nums">
                <span>{displayBatchYear ?? "—"}</span><span>{currentYear}</span>
              </div>
            </div>
          </div>
        </ProfileSection>

        {/* Service Record */}
        <ProfileSection title="Service Record" icon={<Shield className="h-3.5 w-3.5" />}>
          <ProfileStatTile
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="Batch"
            value={displayBatchYear?.toString() || "Not listed"}
            sub={appointmentDateRaw ? "Joined " + (formatSourceDate(appointmentDateRaw) || appointmentDateRaw) : "Joining date not listed"}
            theme="blue"
          />
          <ProfileStatTile
            icon={<Timer className="h-3.5 w-3.5" />}
            label="Service"
            value={serviceYears === null ? "Not listed" : serviceYears + " yrs"}
            sub={displayBatchYear ? displayBatchYear + " — present" : "Service start date unavailable"}
            theme="emerald"
          />
          <ProfileStatTile
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Cadre"
            value={cadre || "Not listed"}
            sub="Cadre in officer record"
            theme="orange"
          />
          <ProfileStatTile
            icon={<UserCheck className="h-3.5 w-3.5" />}
            label="Entry"
            value={recruitment || "Not listed"}
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
                  <div className="mt-1.5 text-4xl font-bold leading-none tracking-tighter tabular-nums">
                    {medals.length}
                    <span className="ml-2 text-base font-semibold tracking-normal text-amber-100">
                      {medals.length === 1 ? "medal" : "medals"}
                    </span>
                  </div>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-inset ring-white/20">
                  <Medal className="h-4 w-4" />
                </span>
              </div>

              {medals.length > 0 ? (
                <div className="mt-5 space-y-2.5">
                  {medals.map((medal, index) => (
                    <div key={medal.code + medal.year + index} className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3.5 py-2.5 ring-1 ring-inset ring-white/15">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Star className="h-3.5 w-3.5 shrink-0 text-amber-200" />
                        <span className="min-w-0 text-[11px] font-semibold leading-snug">{medal.name}</span>
                      </div>
                      <span className="ml-3 shrink-0 text-xs font-bold tabular-nums">{medal.year}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[10px] leading-relaxed text-amber-100/80">
                  No decoration details are included in this officer source record.
                </p>
              )}
              {medalSource && (
                <p className="mt-3 text-[9px] leading-relaxed text-amber-100/75">
                  Source notation: {medalSource}
                </p>
              )}
            </div>
          </div>

          <ProfileStatTile
            icon={<GraduationCap className="h-3.5 w-3.5" />}
            label="Education"
            value={education || "Not listed"}
            sub="Education record"
            theme="violet"
          />
          <ProfileStatTile
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            label={officer.service_type + " ID"}
            value={officer.employee_id || sourceText(source, "ips_id") || "Not listed"}
            sub={sourceLabel}
            theme="blue"
          />
        </ProfileSection>
      </div>

      {/* === FOOTER === */}
      <div className="border-t border-zinc-100 bg-zinc-50/80 px-5 py-3.5">
        <p className="text-center text-[10px] leading-relaxed text-zinc-500">
          <span className="font-semibold text-zinc-700">Source:</span> {sourceLabel}.
          {sourceSnapshotDate ? " Snapshot: " + sourceSnapshotDate + "." : " Source snapshot date not listed."}
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
