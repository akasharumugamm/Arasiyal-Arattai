"use client";

import { useEffect, useMemo, useState } from "react";

type ReviewType = "Positive" | "Negative" | "Request";
type Review = {
  id: string;
  profile: string;
  name: string;
  type: ReviewType;
  rating: number;
  title: string;
  body: string;
  date: string;
};

const STORAGE_KEY = "tn-government-explorer-reviews-v1";
const PROFILES = [
  "C. Joseph Vijay",
  "N. Anand",
  "Aadhav Arjuna",
  "Dr. K.G. Arunraj",
  "K.A. Sengottaiyan",
  "P. Venkataramanan",
  "R. Nirmalkumar",
  "Rajmohan",
  "Dr. T.K. Prabhu",
  "Selvi S. Keerthana",
  "P. Viswanathan",
  "S. Rajesh Kumar",
  "A.M. Shahjahan",
  "Vanni Arasu",
  "A. Vijay Tamilan Parthiban",
  "B. Rajkumar",
  "V. Sampath Kumar",
  "M. Vijay Balaji",
  "K. Vignesh",
  "K. Thennarasu",
  "J. Mohamed Farvas",
  "V. Gandhiraj",
  "Jagadeshwari K.",
  "R. Vinoth",
  "C. Vijayalakshmi",
  "D. Sarathkumar",
  "Ramesh",
  "P. Mathan Raja",
  "N. Marie Wilson",
  "A. Srinath",
  "S. Kamali",
  "Dr. Kumar R",
  "R.V. Ranjithkumar",
  "D. Logesh Tamilselvan",
  "Dr. V.K. Rajeev",
];

const typeStyles: Record<ReviewType, { color: string; background: string; description: string }> = {
  Positive: { color: "#166534", background: "#dcfce7", description: "Share a positive observation or outcome" },
  Negative: { color: "#991b1b", background: "#fee2e2", description: "Describe a concern or poor outcome" },
  Request: { color: "#1d4ed8", background: "#dbeafe", description: "Suggest an action or ask for a response" },
};

function Stars({ value, onChange, size = 28 }: { value: number; onChange?: (n: number) => void; size?: number }) {
  return (
    <div role={onChange ? "radiogroup" : "img"} aria-label={`${value} out of 5 stars`} style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} aria-label={`${n} star`} aria-pressed={onChange ? value === n : undefined} style={{ cursor: onChange ? "pointer" : "default", padding: 0, border: 0, background: "transparent", color: n <= value ? "#f59e0b" : "#cbd5e1", fontSize: size, lineHeight: 1 }}>
          ★
        </button>
      ))}
    </div>
  );
}

function RatingGauge({ value }: { value: number | null }) {
  const cx = 150, cy = 140, r = 112;
  const point = (angle: number, radius: number) => ({ x: cx + radius * Math.cos((angle * Math.PI) / 180), y: cy + radius * Math.sin((angle * Math.PI) / 180) });
  const colors = ["#ff533d", "#ff922b", "#ffe52e", "#a5ed50", "#13c967"];
  const faces = ["☹", "☹", "😐", "☺", "☺"];
  const path = (start: number, end: number) => {
    const a = point(start, r), b = point(end, r);
    return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 0 1 ${b.x} ${b.y} Z`;
  };
  const angle = value === null ? null : 180 + Math.max(0, Math.min(100, value)) * 1.8;
  const tip = angle === null ? null : point(angle, 86);
  return (
    <div style={{ maxWidth: 300, margin: "0 auto" }}>
      <svg viewBox="0 0 300 160" style={{ width: "100%", display: "block" }} role="img" aria-label={value === null ? "No public ratings yet" : `Average rating ${Math.round(value)} out of 100`}>
        {colors.map((color, i) => <path key={color} d={path(180 + i * 36, 216 + i * 36)} fill={color} stroke="white" strokeWidth="1.5" />)}
        {faces.map((face, i) => { const p = point(198 + i * 36, 74); return <text key={i} x={p.x} y={p.y + 6} textAnchor="middle" fontSize="20" fill={i < 2 ? "#a83224" : i === 2 ? "#997600" : "#178b43"}>{face}</text>; })}
        {tip && <path d={`M ${cx} ${cy} L ${tip.x} ${tip.y}`} stroke="#10294f" strokeWidth="5" strokeLinecap="round" />}
        <circle cx={cx} cy={cy} r="9" fill="#10294f" />
      </svg>
      <div style={{ textAlign: "center", marginTop: -1 }}>
        <div style={{ fontSize: 27, fontWeight: 900, color: "#0f172a" }}>{value === null ? "—" : Math.round(value)}<span style={{ fontSize: 13, color: "#64748b" }}> / 100</span></div>
        <div style={{ fontSize: 11, color: "#64748b" }}>{value === null ? "No public ratings yet" : "Community average"}</div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profile, setProfile] = useState(PROFILES[0]);
  const [filter, setFilter] = useState<"All" | ReviewType>("All");
  const [name, setName] = useState("");
  const [type, setType] = useState<ReviewType>("Positive");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setReviews(JSON.parse(saved) as Review[]);
    } catch { /* Ignore invalid local browser data. */ }
    const params = new URLSearchParams(window.location.search);
    const requestedProfile = params.get("profile");
    if (requestedProfile && PROFILES.includes(requestedProfile)) setProfile(requestedProfile);
    setShowForm(params.get("action") === "write");
  }, []);

  const profileReviews = useMemo(() => reviews.filter((review) => review.profile === profile), [reviews, profile]);
  const visibleReviews = useMemo(() => profileReviews.filter((review) => filter === "All" || review.type === filter), [profileReviews, filter]);
  const average = profileReviews.length ? profileReviews.reduce((sum, review) => sum + review.rating, 0) / profileReviews.length : null;
  const overallAverage = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null;

  function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !title.trim() || !body.trim()) {
      setNotice("Please fill in your name, review title and review details.");
      return;
    }
    const next: Review = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      profile, name: name.trim(), type, rating, title: title.trim(), body: body.trim(),
      date: new Date().toISOString(),
    };
    const updated = [next, ...reviews];
    setReviews(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* The current session still works if storage is unavailable. */ }
    setName(""); setTitle(""); setBody(""); setRating(5); setNotice("Your review has been added on this browser."); setFilter("All"); setShowForm(false);
  }

  function removeReview(id: string) {
    const updated = reviews.filter((review) => review.id !== id);
    setReviews(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* Keep current UI state. */ }
  }

  const panel: React.CSSProperties = { background: "white", border: "1px solid #e2e8f0", borderRadius: 18, padding: 22, boxShadow: "0 8px 28px #0f172a08" };
  const label: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 7 };
  const input: React.CSSProperties = { width: "100%", border: "1px solid #cbd5e1", borderRadius: 10, padding: "11px 12px", font: "inherit", fontSize: 14, background: "white", color: "#0f172a", boxSizing: "border-box" };

  return (
    <main style={{ minHeight: "100vh", background: "#f5f7fb", color: "#0f172a", padding: "28px 18px 56px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <a href="/" style={{ display: "inline-flex", gap: 8, alignItems: "center", color: "#1d4ed8", textDecoration: "none", fontSize: 13, fontWeight: 800, marginBottom: 22 }}>← Back to Government Explorer</a>
        <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 24 }}>
          <div>
            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>Public voice · Accountability</div>
            <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)", lineHeight: 1.1, letterSpacing: -1.5, margin: "9px 0", fontWeight: 900 }}>Community Reviews</h1>
            <p style={{ maxWidth: 650, color: "#64748b", lineHeight: 1.65, margin: 0 }}>Share a public assessment, raise a concern, or request action about a government representative. Keep comments specific, respectful and evidence-based.</p>
          </div>
          <button onClick={() => { setShowForm((v) => !v); setNotice(""); }} style={{ border: 0, borderRadius: 11, background: "#1d4ed8", color: "white", padding: "13px 18px", fontWeight: 850, cursor: "pointer" }}>{showForm ? "Close form" : "✍ Write a review"}</button>
        </header>

        <section style={{ ...panel, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 20, alignItems: "center" }}>
            <div>
              <label style={label} htmlFor="profile-select">Choose a representative</label>
              <select id="profile-select" value={profile} onChange={(e) => { setProfile(e.target.value); setFilter("All"); setNotice(""); }} style={input}>{PROFILES.map((p) => <option key={p}>{p}</option>)}</select>
              <p style={{ color: "#64748b", fontSize: 11, margin: "8px 0 0" }}>Reviews and scores are shown separately for each profile.</p>
            </div>
            <RatingGauge value={average === null ? null : (average / 5) * 100} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 15 }}><div style={{ fontSize: 25, fontWeight: 900 }}>{profileReviews.length}</div><div style={{ color: "#64748b", fontSize: 12 }}>Reviews for this profile</div></div>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 15 }}><div style={{ fontSize: 25, fontWeight: 900 }}>{average === null ? "—" : average.toFixed(1)}<span style={{ fontSize: 12, color: "#64748b" }}>/5</span></div><div style={{ color: "#64748b", fontSize: 12 }}>Average stars</div></div>
              <div style={{ gridColumn: "1 / -1", color: "#64748b", fontSize: 11 }}>Explorer-wide: {overallAverage === null ? "No ratings yet" : `${overallAverage.toFixed(1)} / 5 from ${reviews.length} review(s)`}</div>
            </div>
          </div>
        </section>

        {showForm && <section style={{ ...panel, marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 5px", fontSize: 21, fontWeight: 900 }}>Write your review</h2>
          <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 13 }}>You can submit more than one review, including multiple reviews for the same person.</p>
          <form onSubmit={submitReview}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <div><label style={label} htmlFor="review-name">Your display name</label><input id="review-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter a name" maxLength={60} style={input} required /></div>
              <div><label style={label} htmlFor="review-type">Review type</label><select id="review-type" value={type} onChange={(e) => setType(e.target.value as ReviewType)} style={input}>{(["Positive", "Negative", "Request"] as ReviewType[]).map((t) => <option key={t} value={t}>{t} — {typeStyles[t].description}</option>)}</select></div>
            </div>
            <div style={{ marginTop: 18 }}><label style={label}>Your rating</label><Stars value={rating} onChange={setRating} /><div style={{ fontSize: 11, color: "#64748b", marginTop: 7 }}>{rating} out of 5 stars</div></div>
            <div style={{ marginTop: 18 }}><label style={label} htmlFor="review-title">Review headline</label><input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarise your point" maxLength={100} style={input} required /></div>
            <div style={{ marginTop: 18 }}><label style={label} htmlFor="review-body">Details and evidence</label><textarea id="review-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Explain the experience, outcome, source or action requested..." minLength={10} maxLength={1500} rows={5} style={{ ...input, resize: "vertical" }} required /></div>
            <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>Do not post private information, threats, or unverified allegations as established facts. Clearly identify claims as allegations and include public sources where possible.</p>
            {notice && <p role="status" style={{ color: "#1d4ed8", fontSize: 13, fontWeight: 700 }}>{notice}</p>}
            <button type="submit" style={{ border: 0, borderRadius: 10, background: "#1d4ed8", color: "white", padding: "12px 18px", fontWeight: 850, cursor: "pointer" }}>Publish review</button>
          </form>
        </section>}

        <section>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div><h2 style={{ margin: 0, fontSize: 23, fontWeight: 900 }}>Public reviews</h2><p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 12 }}>Newest first · {visibleReviews.length} shown</p></div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>{(["All", "Positive", "Negative", "Request"] as const).map((t) => <button key={t} onClick={() => setFilter(t)} style={{ border: filter === t ? "1px solid #1d4ed8" : "1px solid #cbd5e1", background: filter === t ? "#dbeafe" : "white", color: filter === t ? "#1d4ed8" : "#475569", borderRadius: 999, padding: "8px 13px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>{t}</button>)}</div>
          </div>
          {notice && !showForm && <p role="status" style={{ color: "#166534", fontSize: 13, fontWeight: 700 }}>{notice}</p>}
          {visibleReviews.length === 0 ? <div style={{ ...panel, textAlign: "center", padding: "42px 20px" }}><div style={{ fontSize: 34 }}>✦</div><h3 style={{ fontSize: 18, fontWeight: 900, margin: "10px 0 6px" }}>No public reviews yet</h3><p style={{ maxWidth: 430, margin: "0 auto 18px", color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>Be the first to share a specific, constructive review of {profile}.</p><button onClick={() => { setShowForm(true); setType("Positive"); }} style={{ border: 0, borderRadius: 10, background: "#1d4ed8", color: "white", padding: "11px 16px", fontWeight: 850, cursor: "pointer" }}>Write the first review</button></div> : <div style={{ display: "grid", gap: 12 }}>{visibleReviews.map((review) => <article key={review.id} style={panel}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}><div style={{ width: 42, height: 42, borderRadius: 14, display: "grid", placeItems: "center", background: "#e2e8f0", color: "#334155", fontWeight: 900 }}>{review.name.slice(0, 1).toUpperCase()}</div><div><div style={{ fontWeight: 850 }}>{review.name}</div><div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{new Date(review.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {review.profile}</div></div></div>
              <span style={{ borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 900, color: typeStyles[review.type].color, background: typeStyles[review.type].background }}>{review.type}</span>
            </div>
            <div style={{ marginTop: 15 }}><Stars value={review.rating} size={19} /><h3 style={{ margin: "7px 0", fontSize: 17, fontWeight: 900 }}>{review.title}</h3><p style={{ margin: 0, color: "#475569", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{review.body}</p></div>
            <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 15, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}><span style={{ fontSize: 11, color: "#64748b" }}>Community-submitted · not independently verified</span><button onClick={() => removeReview(review.id)} style={{ border: "1px solid #cbd5e1", background: "white", color: "#64748b", borderRadius: 8, padding: "6px 9px", fontSize: 11, cursor: "pointer" }}>Remove from this browser</button></div>
          </article>)}</div>}
        </section>
        <footer style={{ marginTop: 28, color: "#94a3b8", fontSize: 11, lineHeight: 1.7 }}>Prototype note: reviews are stored in this browser only using local storage. They are not shared with other visitors or saved to a server yet. A backend and moderation system are needed for a public, shared review platform.</footer>
      </div>
    </main>
  );
}
