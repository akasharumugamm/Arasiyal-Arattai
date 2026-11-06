import React from "react";
import {
  Award, Users, TrendingUp, TrendingDown, Vote, Briefcase, FileText,
  GraduationCap, Gavel, ArrowUpRight, User, MapPin, BadgeCheck
} from "lucide-react";

export function PoliticianDashboard() {
  return (
    <div className="w-full font-[Inter] text-zinc-900 antialiased">
      <div className="relative w-full overflow-hidden rounded-[24px] bg-white shadow-[0_18px_45px_-14px_rgba(0,0,0,0.2)] ring-1 ring-zinc-950/5">
        <div className="relative overflow-hidden bg-zinc-950 px-5 pb-6 pt-5">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <h1 className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">Selected Profile</h1>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div className="relative shrink-0">
                <div aria-hidden className="absolute -inset-[3px] rounded-[24px] bg-gradient-to-tr from-blue-500 via-violet-500 to-fuchsia-500" />
                <img src="https://i.ibb.co/0Rv80BLn/HR-9-Y6yb0-AAzx-FY.jpg" alt="C. Joseph Vijay" className="relative h-20 w-20 rounded-[22px] object-cover object-center ring-4 ring-zinc-950" />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 ring-4 ring-zinc-950">
                  <BadgeCheck className="h-3.5 w-3.5 text-white" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-bold tracking-tight text-white">C. Joseph Vijay</h2>
                <p className="mt-0.5 text-xs font-medium text-zinc-400">Chief Minister · Tamil Nadu</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <GlassChip>Age 52</GlassChip><GlassChip accent>TVK</GlassChip><GlassChip>Sitting MLA</GlassChip>
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10 backdrop-blur-xl">
              <div className="mb-3.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Public Sentiment</span>
                <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold text-amber-300 ring-1 ring-inset ring-amber-400/25">Mixed feedback</span>
              </div>
              <div className="mb-4 flex items-end justify-between">
                <div className="flex items-baseline gap-1.5"><span className="text-5xl font-bold leading-none tracking-tighter text-white tabular-nums">67</span><span className="text-sm font-medium text-zinc-500">/ 100</span></div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"><div className="h-full w-[67%] rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_16px_rgba(251,146,60,0.55)]" /></div>
              <div className="mt-2 flex justify-between text-[9px] font-medium text-zinc-500 tabular-nums"><span>0</span><span>50</span><span>100</span></div>
              <p className="mt-3 text-[10px] leading-relaxed text-zinc-500">Calculated dynamically from positive and negative public reviews only.</p>
            </div>
          </div>
        </div>
        <div className="space-y-6 p-5">
          <Section title="2026 Election Mandate" icon={<Award className="h-3.5 w-3.5" />}>
            <div className="relative col-span-2 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 text-white">
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-start justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">Total Votes Won</div><div className="mt-1.5 text-4xl font-bold leading-none tracking-tighter tabular-nums">1,20,365</div></div><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-inset ring-white/20"><ArrowUpRight className="h-4 w-4" /></span></div>
                <div className="mt-5 space-y-2.5">
                  <div><div className="mb-1 flex justify-between text-[10px] font-semibold"><span>C. Joseph Vijay · TVK</span><span className="tabular-nums">1,20,365</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/25"><div className="h-full w-full rounded-full bg-white" /></div></div>
                  <div><div className="mb-1 flex justify-between text-[10px] font-semibold"><span className="text-blue-200">R.D. Shekar · DMK</span><span className="text-blue-200 tabular-nums">66,650</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[55%] rounded-full bg-white/50" /></div></div>
                </div>
              </div>
            </div>
            <div className="col-span-2 flex min-h-[110px] items-center gap-4 rounded-2xl bg-amber-50/70 p-4 ring-1 ring-inset ring-amber-900/5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-amber-100"><img src="/tamil_nadu_234_constituencies_geojson_design/constituency_012.png" alt="Perambur constituency map" className="h-full w-full object-contain" /></div>
              <div className="min-w-0 flex-1"><div className="mb-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-red-600"><MapPin className="h-3 w-3" /> AC 12 · Chennai district</div><div className="text-lg font-bold leading-tight tracking-tight text-zinc-900">Perambur</div><div className="mt-0.5 text-sm text-zinc-600"><span className="font-bold text-zinc-900 tabular-nums">298</span> polling booths</div></div>
            </div>
            <StatTile icon={<TrendingUp className="h-3.5 w-3.5" />} label="Vote Share" value="58.9%" theme="violet" />
            <StatTile icon={<Vote className="h-3.5 w-3.5" />} label="Margin" value="53,715" theme="emerald" />
            <StatTile icon={<Users className="h-3.5 w-3.5" />} label="Turnout" value="90.3%" theme="orange" />
            <StatTile icon={<User className="h-3.5 w-3.5" />} label="Candidates" value="47" theme="blue" />
          </Section>
          <Section title="Affidavit Declarations" icon={<FileText className="h-3.5 w-3.5" />}>
            <StatTile icon={<Briefcase className="h-3.5 w-3.5" />} label="Assets" value="₹648.86 cr" theme="emerald" />
            <StatTile icon={<TrendingDown className="h-3.5 w-3.5" />} label="Liabilities" value="₹7.64 cr" theme="orange" />
            <StatTile icon={<Gavel className="h-3.5 w-3.5" />} label="Pending Cases" value="2" theme="rose" />
            <StatTile icon={<GraduationCap className="h-3.5 w-3.5" />} label="Education" value="12th Pass" theme="violet" />
          </Section>
        </div>
        <div className="border-t border-zinc-100 bg-zinc-50/80 px-5 py-3.5">
          <p className="text-center text-[10px] leading-relaxed text-zinc-500"><span className="font-semibold text-zinc-700">Source:</span> ECI (results.eci.gov.in) & Affidavit records (myneta.info/).<br />Cases are pending, not convictions.</p>
          <p className="mt-2 text-center text-[9px] text-amber-700">Prototype figures — verify against official records before publication.</p>
        </div>
      </div>
    </div>
  );
}

function GlassChip({ children, accent }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${accent ? "bg-blue-400/15 text-blue-300 ring-blue-400/25" : "bg-white/[0.07] text-zinc-300 ring-white/10"}`}>{children}</span>;
}

function Section({ title, icon, children }) {
  return <section><div className="mb-3 flex items-center gap-2 px-0.5"><span className="text-zinc-400">{icon}</span><h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{title}</h2><div className="h-px flex-1 bg-zinc-100" /></div><div className="grid grid-cols-2 gap-3">{children}</div></section>;
}

function StatTile({ icon, label, value, theme }) {
  const themes = { emerald: "bg-emerald-500/10 text-emerald-600", violet: "bg-violet-500/10 text-violet-600", orange: "bg-orange-500/10 text-orange-600", rose: "bg-rose-500/10 text-rose-600", blue: "bg-blue-500/10 text-blue-600" };
  return <div className="group rounded-2xl bg-zinc-50/70 p-4 ring-1 ring-inset ring-zinc-950/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-zinc-900/[0.06] hover:ring-zinc-950/10"><div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${themes[theme]}`}>{icon}</div><div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</div><div className="text-lg font-bold leading-none tracking-tight text-zinc-900 tabular-nums">{value}</div></div>;
}
