import React from 'react';
import { 
  Landmark, Users, Vote, TrendingUp, Target, 
  Scale, CircleDashed, User, BarChart3
} from 'lucide-react';

// === Data ===
const PARTIES = [
  { name: 'TVK+',   seats: 118, color: '#fbbf24' }, // amber
  { name: 'DMK',    seats: 60,  color: '#ef4444' }, // red
  { name: 'AIADMK', seats: 46,  color: '#34d399' }, // green
  { name: 'Others', seats: 5,   color: '#fb923c' }, // orange
  { name: 'Vacant', seats: 5,   color: '#71717a' }, // zinc
];

// === Hemicycle generator ===
function buildHemicycle(parties, rows = 6, innerR = 52, gap = 12) {
  const total = parties.reduce((s, p) => s + p.seats, 0);
  const radii = Array.from({ length: rows }, (_, i) => innerR + i * gap);
  const totalArc = radii.reduce((s, r) => s + Math.PI * r, 0);

  const perRow = radii.map(r => Math.round((Math.PI * r / totalArc) * total));
  let assigned = perRow.reduce((a, b) => a + b, 0);
  let i = rows - 1;
  while (assigned !== total) {
    const d = assigned < total ? 1 : -1;
    perRow[i] += d; assigned += d;
    i = (i - 1 + rows) % rows;
  }

  const dots = [];
  radii.forEach((r, row) => {
    const n = perRow[row];
    for (let k = 0; k < n; k++) {
      const angle = Math.PI - (Math.PI * k) / (n - 1);
      dots.push({ x: +(r * Math.cos(angle)).toFixed(2), y: +(-r * Math.sin(angle)).toFixed(2), angle });
    }
  });
  dots.sort((a, b) => b.angle - a.angle);

  const colored = [];
  let idx = 0;
  parties.forEach(p => {
    for (let s = 0; s < p.seats; s++) colored.push({ ...dots[idx++], fill: p.color });
  });
  return colored;
}

const HEMICYCLE = buildHemicycle(PARTIES);

export function ElectionResultsDashboard() {
  return (
    <div className="w-full flex items-start justify-center font-[Inter] text-zinc-900 antialiased">
      
      <div className="relative w-full max-w-[380px] bg-white rounded-[28px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18)] ring-1 ring-zinc-950/5 overflow-hidden">
        
        {/* === HERO (DARK) === */}
        <div className="relative bg-zinc-950 px-6 pt-6 pb-7 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-rose-600/20 blur-3xl" />

          <div className="relative">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <h1 className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                TN Assembly 2026
              </h1>
            </div>

            {/* Headline */}
            <h2 className="mt-4 text-xl font-bold leading-snug tracking-tight text-white">
              TVK leads, but the House is{' '}
              <em className="font-serif font-medium text-amber-300">hung</em> and a{' '}
              <em className="font-serif font-medium text-amber-300">coalition</em> rules
            </h2>
            <p className="mt-2.5 text-xs leading-relaxed text-zinc-400">
              TVK won <span className="font-bold text-white tabular-nums">108 seats</span>, ten short of the <span className="font-semibold text-zinc-200">118</span> needed for a majority. It governs with its allies and outside support from <span className="font-semibold text-zinc-200">22 MLAs</span>.
            </p>

            {/* Hemicycle — glass panel */}
            <div className="mt-6 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10 backdrop-blur-xl">
              <div className="text-center text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                Majority mark 118
              </div>

              <svg viewBox="-118 -128 236 142" className="w-full">
                {/* Majority marker — stops just above the outer arc */}
                <line x1="0" y1="-126" x2="0" y2="-116" stroke="#52525b" strokeWidth="1" strokeDasharray="3 3" />

                {HEMICYCLE.map((d, i) => (
                  <circle key={i} cx={d.x} cy={d.y} r="3" fill={d.fill} />
                ))}

                {/* Seat count — sits in the hollow, clear of the inner arc */}
                <text x="0" y="-18" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700" className="tabular-nums">
                  234
                </text>
                <text x="0" y="-6" textAnchor="middle" fill="#71717a" fontSize="7" fontWeight="600" letterSpacing="2.5">
                  SEATS
                </text>
              </svg>

              {/* Legend */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                {PARTIES.map(p => (
                  <span key={p.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-[10px] font-medium text-zinc-400">{p.name}</span>
                    <span className="text-xs font-bold text-white tabular-nums">{p.seats}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* === BODY === */}
        <div className="space-y-6 p-5">
          
          {/* The Assembly today */}
          <Section title="The Assembly today" icon={<Landmark className="h-3.5 w-3.5" />}>
            <StatTile icon={<Users className="h-3.5 w-3.5" />} label="Sitting MLAs" value="229 / 234" sub="Current House strength" theme="blue" />
            <StatTile icon={<CircleDashed className="h-3.5 w-3.5" />} label="Vacant Seats" value="5" sub="All 5 await poll schedule" theme="orange" />
            <StatTile icon={<Target className="h-3.5 w-3.5" />} label="Majority Mark" value="118" sub="115 in today's House of 229" theme="amber" />
            <StatTile icon={<Scale className="h-3.5 w-3.5" />} label="Status" value="Hung" sub="No party at 118 alone" theme="rose" />
          </Section>

          {/* The vote in numbers */}
          <Section 
            title="The vote in numbers" 
            icon={<BarChart3 className="h-3.5 w-3.5" />}
            action={<a className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer">All statistics →</a>}
          >
            {/* Turnout — dark feature card */}
            <div className="relative col-span-2 overflow-hidden rounded-2xl bg-zinc-900 p-5 text-white ring-1 ring-zinc-950/10">
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
              <div className="relative">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                  Voter Turnout
                </div>
                <div className="mt-1.5 text-4xl font-bold leading-none tracking-tighter tabular-nums">
                  85.1%
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
                  <TrendingUp className="h-3 w-3" /> Up 12.4 pts on 2021
                </div>

                <div className="mt-5 space-y-2.5">
                  <div>
                    <div className="mb-1 flex justify-between text-[10px] font-semibold">
                      <span>2026</span>
                      <span className="tabular-nums">85.10%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                      <div className="h-full w-[85.1%] rounded-full bg-white" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-[10px] font-semibold text-zinc-400">
                      <span>2021</span>
                      <span className="tabular-nums">72.70%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[72.7%] rounded-full bg-white/40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <StatTile icon={<Users className="h-3.5 w-3.5" />} label="Electors" value="5.73 Cr" sub="5,73,50,000" theme="violet" />
            <StatTile icon={<Vote className="h-3.5 w-3.5" />} label="Votes Polled" value="4.88 Cr" sub="4,87,98,833" theme="emerald" />
            <StatTile icon={<User className="h-3.5 w-3.5" />} label="Candidates" value="4,023" sub="From 124 parties" theme="blue" className="col-span-2" />
          </Section>
        </div>

        {/* === FOOTER === */}
        <div className="border-t border-zinc-100 bg-zinc-50/80 px-5 py-3.5">
          <p className="text-center text-[10px] leading-relaxed text-zinc-500">
            <span className="font-semibold text-zinc-700">Source:</span> ECI (results.eci.gov.in) · TN Assembly Election 2026.<br />
            TVK+ includes alliance partners and supporting MLAs.
          </p>
        </div>
      </div>
    </div>
  );
}

// === Reusable Components (same as profile card) ===

function Section({ title, icon, action, children }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 px-0.5">
        <span className="text-zinc-400">{icon}</span>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          {title}
        </h2>
        <div className="h-px flex-1 bg-zinc-100" />
        {action}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {children}
      </div>
    </section>
  );
}

function StatTile({ icon, label, value, sub, theme, className = '' }) {
  const themes = {
    emerald: "bg-emerald-500/10 text-emerald-600",
    violet: "bg-violet-500/10 text-violet-600",
    orange: "bg-orange-500/10 text-orange-600",
    amber: "bg-amber-500/10 text-amber-600",
    rose: "bg-rose-500/10 text-rose-600",
    blue: "bg-blue-500/10 text-blue-600",
  };

  return (
    <div className={`group rounded-2xl bg-zinc-50/70 p-4 ring-1 ring-inset ring-zinc-950/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-zinc-900/[0.06] hover:ring-zinc-950/10 ${className}`}>
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${themes[theme]}`}>
        {icon}
      </div>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </div>
      <div className="text-lg font-bold leading-none tracking-tight text-zinc-900 tabular-nums">
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