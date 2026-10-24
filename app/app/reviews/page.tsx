"use client";

import Link from "next/link";
import mlaDirectory from "@/data/tn-mlas.json";
import { useEffect, useMemo, useState } from "react";

type ReviewType = "Positive" | "Concern" | "Allegation" | "Request";
type Official = { name: string; category: string };
type Comment = { id: string; parentCommentId?: string | null; body: string; date: string; name: string };
type Review = {
  id: string; name: string; type: ReviewType; title: string; body: string; date: string;
  officials: Official[]; imageUrls: string[]; votes?: { up: number; down: number };
  myVote?: "up" | "down" | null; commentCount?: number;
};
const TYPE_OPTIONS: { value: ReviewType; label: string; detail: string; color: string; tint: string }[] = [
  { value: "Positive", label: "Positive", detail: "Recognise a positive action or outcome", color: "#15803d", tint: "#dcfce7" },
  { value: "Concern", label: "Concern", detail: "Describe a problem or poor outcome", color: "#b45309", tint: "#fef3c7" },
  { value: "Allegation", label: "Allegation", detail: "Clearly label claims and share credible sources", color: "#b91c1c", tint: "#fee2e2" },
  { value: "Request", label: "Request", detail: "Ask for action, clarity or a public response", color: "#1d4ed8", tint: "#dbeafe" },
];
const FEATURED: Official[] = [
  { name: "C. Joseph Vijay", category: "Chief Minister" },
  { name: "Governor of Tamil Nadu", category: "Governor" },
  { name: "N. Anand", category: "Minister" }, { name: "Aadhav Arjuna", category: "Minister" },
  { name: "Dr. K.G. Arunraj", category: "Minister" }, { name: "K.A. Sengottaiyan", category: "Minister" },
  { name: "P. Venkataramanan", category: "Minister" }, { name: "R. Nirmalkumar", category: "Minister" },
  { name: "Rajmohan", category: "Minister" }, { name: "Dr. T.K. Prabhu", category: "Minister" },
  { name: "Selvi S. Keerthana", category: "Minister" }, { name: "P. Viswanathan", category: "Minister" },
  { name: "S. Rajesh Kumar", category: "Minister" }, { name: "A.M. Shahjahan", category: "Minister" },
  { name: "Vanni Arasu", category: "Minister" }, { name: "A. Vijay Tamilan Parthiban", category: "Minister" },
  { name: "B. Rajkumar", category: "Minister" }, { name: "V. Sampath Kumar", category: "Minister" },
  { name: "M. Vijay Balaji", category: "Minister" }, { name: "K. Vignesh", category: "Minister" },
  { name: "K. Thennarasu", category: "Minister" }, { name: "J. Mohamed Farvas", category: "Minister" },
  { name: "V. Gandhiraj", category: "Minister" }, { name: "Jagadeshwari K.", category: "Minister" },
  { name: "R. Vinoth", category: "Minister" }, { name: "C. Vijayalakshmi", category: "Minister" },
  { name: "D. Sarathkumar", category: "Minister" }, { name: "Ramesh", category: "Minister" },
  { name: "P. Mathan Raja", category: "Minister" }, { name: "N. Marie Wilson", category: "Minister" },
  { name: "A. Srinath", category: "Minister" }, { name: "S. Kamali", category: "Minister" },
  { name: "Dr. Kumar R", category: "Minister" }, { name: "R.V. Ranjithkumar", category: "Minister" },
  { name: "D. Logesh Tamilselvan", category: "Minister" }, { name: "Dr. V.K. Rajeev", category: "Minister" },
];
const MLA_OFFICIALS: Official[] = (mlaDirectory.members as { name: string; constituency: string; status: string }[])
  .filter((member) => member.status !== "Vacant")
  .map((member) => ({ name: member.name, category: "MLA" }));
const OFFICIALS = [...FEATURED, ...MLA_OFFICIALS]
  .filter((item, index, all) => all.findIndex((other) => other.name.toLowerCase() === item.name.toLowerCase()) === index)
  .sort((a, b) => a.category === "Chief Minister" ? -1 : b.category === "Chief Minister" ? 1 : a.name.localeCompare(b.name));

function CustomDropdown<T extends string>({ value, options, onChange, label }: {
  value: T; options: { value: T; label: string; detail?: string; color?: string; tint?: string }[];
  onChange: (value: T) => void; label: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((item) => item.value === value) ?? options[0];
  return <div className="aa-dropdown">
    <button type="button" className="aa-dropdown-trigger" aria-expanded={open} aria-label={label} onClick={() => setOpen(!open)}>
      <span>{selected.label}</span><span aria-hidden="true">{open ? "⌃" : "⌄"}</span>
    </button>
    {open && <><button className="aa-click-away" aria-label="Close menu" onClick={() => setOpen(false)} />
      <div className="aa-dropdown-menu" role="listbox" aria-label={label}>
        {options.map((option) => <button key={option.value} type="button" role="option" aria-selected={option.value === value}
          className={option.value === value ? "aa-dropdown-option selected" : "aa-dropdown-option"}
          onClick={() => { onChange(option.value); setOpen(false); }}>
          <span className="aa-option-dot" style={{ background: option.tint ?? "#e2e8f0", color: option.color ?? "#334155" }}>{option.value === value ? "✓" : ""}</span>
          <span><strong>{option.label}</strong>{option.detail && <small>{option.detail}</small>}</span>
        </button>)}
      </div></>}
  </div>;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<"All" | ReviewType>("All");
  const [search, setSearch] = useState("");
  const [selectedOfficials, setSelectedOfficials] = useState<Official[]>([]);
  const [officialSearch, setOfficialSearch] = useState("");
  const [officialCategory, setOfficialCategory] = useState("All officials");
  const [officialPickerOpen, setOfficialPickerOpen] = useState(false);
  const [type, setType] = useState<ReviewType>("Positive");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [oversized, setOversized] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyTo, setReplyTo] = useState<Record<string, string | null>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);
  const [profileName, setProfileName] = useState("");
  const [editProfile, setEditProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  async function loadReviews() {
    try {
      const response = await fetch("/api/reviews", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load public discussions");
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not load discussions"); }
  }
  useEffect(() => {
    void loadReviews();
    fetch("/api/auth/me", { cache: "no-store" }).then((response) => setIsAuthenticated(response.ok)).catch(() => setIsAuthenticated(false));
    fetch("/api/profile", { cache: "no-store" }).then(async (response) => {
      if (response.ok) { const data = await response.json(); setProfileName(data.profile?.name ?? ""); }
    }).catch(() => undefined);
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("profile");
    if (requested) {
      const found = OFFICIALS.find((item) => item.name.toLowerCase() === requested.toLowerCase());
      if (found) queueMicrotask(() => setSelectedOfficials([found]));
    }
    if (params.get("action") === "write") {
      fetch("/api/auth/me", { cache: "no-store" }).then((response) => {
        if (response.ok) document.getElementById("aa-composer")?.scrollIntoView({ behavior: "smooth" });
        else setAuthOpen(true);
      }).catch(() => setAuthOpen(true));
    }
  }, []);
  const filteredOfficials = useMemo(() => OFFICIALS.filter((item) =>
    (officialCategory === "All officials" || item.category === officialCategory) &&
    item.name.toLowerCase().includes(officialSearch.toLowerCase().trim())
  ).slice(0, 100), [officialCategory, officialSearch]);
  const visibleReviews = useMemo(() => reviews.filter((review) =>
    (filter === "All" || review.type === filter) &&
    (!search.trim() || review.officials.some((official) => official.name.toLowerCase().includes(search.toLowerCase().trim())))
  ), [reviews, filter, search]);
  const scored = reviews.filter((review) => review.type === "Positive" || review.type === "Concern");
  const score = scored.length ? Math.round(scored.filter((review) => review.type === "Positive").length / scored.length * 100) : null;

  function toggleOfficial(item: Official) {
    setSelectedOfficials((current) => current.some((chosen) => chosen.name === item.name)
      ? current.filter((chosen) => chosen.name !== item.name)
      : current.length >= 30 ? current : [...current, item]);
  }
  function chooseFiles(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list);
    const tooLarge = picked.some((file) => file.size > 2 * 1024 * 1024);
    setOversized(tooLarge);
    if (tooLarge) return;
    const next = [...files, ...picked].slice(0, 4);
    setFiles(next);
    setPreviews(next.map((file) => URL.createObjectURL(file)));
  }
  function removeImage(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index));
    setPreviews((current) => current.filter((_, i) => i !== index));
    setOversized(false);
  }
  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) { setAuthOpen(true); return; }
    if (!selectedOfficials.length || !title.trim() || !body.trim()) {
      setNotice("Choose at least one official and add a title and discussion details."); return;
    }
    if (files.some((file) => file.size > 2 * 1024 * 1024)) { setOversized(true); return; }
    setSubmitting(true); setNotice("");
    try {
      const imageUrls: string[] = [];
      for (const file of files) {
        const form = new FormData(); form.append("file", file);
        const response = await fetch("/api/uploads/images", { method: "POST", body: form, credentials: "same-origin" });
        const data = await response.json();
        if (!response.ok || !data.imageUrl) throw new Error(data.error || "Image upload failed");
        imageUrls.push(data.imageUrl);
      }
      const response = await fetch("/api/reviews", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ officials: selectedOfficials, type, title: title.trim(), body: body.trim(), imageUrls }),
      });
      const data = await response.json();
      if (!response.ok || !data.review) throw new Error(data.error || "Could not publish discussion");
      setReviews((current) => [data.review, ...current]);
      setTitle(""); setBody(""); setFiles([]); setPreviews([]); setSelectedOfficials([]);
      setNotice("Your discussion is published."); setOversized(false);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not publish discussion"); }
    finally { setSubmitting(false); }
  }
  async function vote(review: Review, direction: "up" | "down") {
    if (!isAuthenticated) { setAuthOpen(true); return; }
    try {
      const response = await fetch(`/api/reviews/${review.id}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ direction }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Vote could not be saved");
      setReviews((current) => current.map((item) => item.id === review.id ? { ...item, myVote: direction, votes: { up: data.upvotes ?? 0, down: data.downvotes ?? 0 } } : item));
    } catch (error) { setNotice(error instanceof Error ? error.message : "Vote could not be saved"); }
  }
  async function loadComments(postId: string) {
    if (commentsByPost[postId]) return;
    try {
      const response = await fetch(`/api/reviews/${postId}/comments`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load comments");
      setCommentsByPost((current) => ({ ...current, [postId]: data.comments ?? [] }));
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not load comments"); }
  }
  async function sendComment(review: Review) {
    const text = (commentInputs[review.id] ?? "").trim();
    if (!text) return;
    if (!isAuthenticated) { setAuthOpen(true); return; }
    try {
      const response = await fetch(`/api/reviews/${review.id}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ body: text, parentCommentId: replyTo[review.id] ?? null }),
      });
      const data = await response.json();
      if (!response.ok || !data.comment) throw new Error(data.error || "Could not post comment");
      setCommentsByPost((current) => ({ ...current, [review.id]: [...(current[review.id] ?? []), data.comment] }));
      setCommentInputs((current) => ({ ...current, [review.id]: "" }));
      setReplyTo((current) => ({ ...current, [review.id]: null }));
      setReviews((current) => current.map((item) => item.id === review.id ? { ...item, commentCount: (item.commentCount ?? 0) + 1 } : item));
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not post comment"); }
  }
  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSavingProfile(true);
    try {
      const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ name: profileName }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save display name");
      setProfileName(data.profile.name); setEditProfile(false); setNotice("Your display name has been updated.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save profile"); }
    finally { setSavingProfile(false); }
  }

  return <main className="aa-page">
    <header className="aa-topbar">
      <Link href="/" className="aa-brand"><span className="aa-brand-mark">அ</span><span><strong>அரசியல் அரட்டை</strong><small>ARASIYAL ARATTAI</small></span></Link>
      <div className="aa-top-actions">
        {isAuthenticated && <button type="button" className="aa-profile-link" onClick={() => setEditProfile(!editProfile)}>{profileName || "Your profile"}　⌄</button>}
        <Link href="/" className="aa-back-link">Explore directory</Link>
      </div>
    </header>
    {editProfile && <form className="aa-profile-editor" onSubmit={saveProfile}><label htmlFor="aa-display-name">Public display name</label><div><input id="aa-display-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} minLength={2} maxLength={60} required /><button disabled={savingProfile}>{savingProfile ? "Saving…" : "Save name"}</button></div></form>}
    <section className="aa-hero">
      <div><div className="aa-eyebrow">PUBLIC VOICE · ACCOUNTABILITY</div><h1>Public discussions</h1><p>Recognise good work, raise concerns, ask for action, and discuss public service. Keep it respectful, specific and evidence-based.</p></div>
      <div className="aa-score"><span>Community sentiment</span><strong>{score === null ? "—" : score}<small>{score === null ? "" : " / 100"}</small></strong><div className="aa-score-track"><i style={{ width: `${score ?? 0}%` }} /></div><small>Based on Positive and Concern posts only</small></div>
    </section>
    <section id="aa-composer" className="aa-composer">
      <div className="aa-composer-heading"><div><span className="aa-eyebrow">YOUR VOICE MATTERS</span><h2>Start a discussion</h2></div><span className="aa-private-note">✦ Public by default</span></div>
      <form onSubmit={submitReview}>
        <label className="aa-field-label" htmlFor="aa-title">Title</label>
        <input id="aa-title" className="aa-text-input" placeholder="What should people know?" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
        <label className="aa-field-label" htmlFor="aa-body">Details</label>
        <textarea id="aa-body" className="aa-textarea" placeholder="Add context, facts, links or what action you want to see…" value={body} onChange={(e) => setBody(e.target.value)} maxLength={10000} rows={4} required />
        <div className="aa-composer-controls">
          <div className="aa-control-block"><label className="aa-field-label">Category</label><CustomDropdown value={type} options={TYPE_OPTIONS} onChange={setType} label="Choose discussion category" /></div>
          <div className="aa-control-block aa-official-block"><label className="aa-field-label">Officials tagged ({selectedOfficials.length})</label>
            <button type="button" className="aa-dropdown-trigger" onClick={() => setOfficialPickerOpen(!officialPickerOpen)} aria-expanded={officialPickerOpen}><span>{selectedOfficials.length ? `${selectedOfficials.length} official${selectedOfficials.length === 1 ? "" : "s"} selected` : "Choose officials"}</span><span>⌄</span></button>
            {officialPickerOpen && <div className="aa-official-picker"><input value={officialSearch} onChange={(e) => setOfficialSearch(e.target.value)} placeholder="Search by name…" aria-label="Search officials" />
              <div className="aa-official-categories">{["All officials", "Chief Minister", "Governor", "Minister", "MLA"].map((category) => <button key={category} type="button" className={officialCategory === category ? "active" : ""} onClick={() => setOfficialCategory(category)}>{category}</button>)}</div>
              <div className="aa-official-results">{filteredOfficials.map((item) => <label key={item.name}><input type="checkbox" checked={selectedOfficials.some((selected) => selected.name === item.name)} onChange={() => toggleOfficial(item)} /><span><strong>{item.name}</strong><small>{item.category}</small></span></label>)}</div>
              <div className="aa-picker-footer"><small>Up to 30 officials per post</small><button type="button" onClick={() => setOfficialPickerOpen(false)}>Done</button></div>
            </div>}
          </div>
        </div>
        {selectedOfficials.length > 0 && <div className="aa-selected-chips">{selectedOfficials.map((item) => <button key={item.name} type="button" onClick={() => toggleOfficial(item)}>{item.name} <span>×</span></button>)}</div>}
        <div className="aa-upload-row"><label className="aa-upload-button">＋ Add photos<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={(e) => chooseFiles(e.target.files)} disabled={files.length >= 4} /></label><span>{files.length}/4 attached</span><small>Up to 4 photos · 2 MB each</small></div>
        {oversized && <p className="aa-error">One or more selected photos exceed 2 MB. Remove them or choose smaller files.</p>}
        {previews.length > 0 && <div className="aa-compose-gallery">{previews.map((url, index) => <div key={url}><button type="button" aria-label={`Remove image ${index + 1}`} onClick={() => removeImage(index)}>×</button><img src={url} alt={`Preview ${index + 1}`} /></div>)}</div>}
        <div className="aa-submit-row"><span>Claims labelled as allegations are not treated as proven facts.</span><button type="submit" disabled={submitting}>{submitting ? "Publishing…" : "Publish discussion ↗"}</button></div>
      </form>
    </section>
    {notice && <div role="status" className="aa-notice">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice">×</button></div>}
    <section className="aa-feed-section">
      <div className="aa-feed-heading"><div><span className="aa-eyebrow">THE PUBLIC CONVERSATION</span><h2>Explore discussions</h2><p>Search by the name of any official to find related posts.</p></div><span className="aa-feed-count">{visibleReviews.length} posts</span></div>
      <div className="aa-feed-controls"><CustomDropdown value={filter} options={[{value:"All" as const,label:"All categories"},{value:"Positive" as const,label:"Positive"},{value:"Concern" as const,label:"Concern"},{value:"Allegation" as const,label:"Allegation"},{value:"Request" as const,label:"Request"}]} onChange={setFilter} label="Filter discussion category" /><div className="aa-search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search officials by name…" aria-label="Search officials by name" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search">×</button>}</div></div>
      {visibleReviews.length === 0 ? <div className="aa-empty"><span>✦</span><h3>No discussions found</h3><p>Try another category or search for a different official. Be the first to start a constructive conversation.</p></div> :
      <div className="aa-feed">{visibleReviews.map((review) => {
        const category = TYPE_OPTIONS.find((item) => item.value === review.type)!;
        const comments = commentsByPost[review.id] ?? [];
        const roots = comments.filter((comment) => !comment.parentCommentId);
        return <article key={review.id} className="aa-post">
          <div className="aa-post-top"><div className="aa-avatar">{(review.name || "U").trim().slice(0,1).toUpperCase()}</div><div className="aa-post-author"><strong>{review.name || "Community member"}</strong><span>{new Date(review.date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span></div><span className="aa-type-pill" style={{ color: category.color, background: category.tint }}>{category.label}</span></div>
          <div className="aa-tagged-officials">{review.officials.map((official) => <Link key={official.name} href={`/?profile=${encodeURIComponent(official.name)}`}>@ {official.name}</Link>)}</div>
          <h3>{review.title}</h3><p className="aa-post-body">{review.body}</p>
          {review.imageUrls?.length > 0 && <div className={`aa-post-gallery count-${Math.min(review.imageUrls.length,4)}`}>{review.imageUrls.map((url,index) => <button key={url} type="button" onClick={() => setLightbox({urls:review.imageUrls,index})} aria-label={`View photo ${index+1}`}><img src={url} alt={`Discussion attachment ${index+1}`} loading="lazy" /></button>)}</div>}
          <div className="aa-post-actions"><button type="button" className={review.myVote === "up" ? "voted" : ""} onClick={() => vote(review,"up")}>↑ <span>{review.votes?.up ?? 0}</span></button><button type="button" className={review.myVote === "down" ? "voted" : ""} onClick={() => vote(review,"down")}>↓ <span>{review.votes?.down ?? 0}</span></button><button type="button" onClick={() => { setExpandedComments((current) => ({...current,[review.id]:!current[review.id]})); void loadComments(review.id); }}>♡ <span>{review.commentCount ?? 0} comments</span></button></div>
          {expandedComments[review.id] && <div className="aa-comments"><div className="aa-comment-list">{roots.map((comment) => <div className="aa-comment" key={comment.id}><div className="aa-comment-avatar">{comment.name.slice(0,1).toUpperCase()}</div><div className="aa-comment-content"><div><strong>{comment.name}</strong><time>{new Date(comment.date).toLocaleDateString()}</time></div><p>{comment.body}</p><button type="button" onClick={() => setReplyTo((current) => ({...current,[review.id]:comment.id}))}>Reply</button>{comments.filter((child) => child.parentCommentId === comment.id).map((child) => <div className="aa-reply" key={child.id}><strong>{child.name}</strong><p>{child.body}</p></div>)}</div></div>)}
          {comments.length === 0 && <p className="aa-no-comments">No comments yet. Start the conversation.</p>}</div>
          {replyTo[review.id] && <div className="aa-replying">Replying to a comment <button type="button" onClick={() => setReplyTo((current) => ({...current,[review.id]:null}))}>Cancel</button></div>}
          <form className="aa-comment-form" onSubmit={(e) => {e.preventDefault(); void sendComment(review);}}><input value={commentInputs[review.id] ?? ""} onChange={(e) => setCommentInputs((current) => ({...current,[review.id]:e.target.value}))} placeholder={replyTo[review.id] ? "Write a reply…" : "Add a respectful comment…"} maxLength={3000} /><button type="submit">Reply ↗</button></form></div>}
        </article>;
      })}</div>}
    </section>
    <footer className="aa-footer"><Link href="/">← Back to the Government Explorer</Link><span>Public discussion · Verify claims before sharing</span></footer>
    {lightbox && <div className="aa-lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setLightbox(null)}><button className="aa-lightbox-close" type="button" onClick={() => setLightbox(null)} aria-label="Close image viewer">×</button><button className="aa-lightbox-prev" type="button" aria-label="Previous image" onClick={(e) => {e.stopPropagation();setLightbox((current) => current ? {...current,index:(current.index+current.urls.length-1)%current.urls.length}:null);}}>‹</button><img src={lightbox.urls[lightbox.index]} alt={`Full-size attachment ${lightbox.index+1}`} onClick={(e) => e.stopPropagation()} /><button className="aa-lightbox-next" type="button" aria-label="Next image" onClick={(e) => {e.stopPropagation();setLightbox((current) => current ? {...current,index:(current.index+1)%current.urls.length}:null);}}>›</button><span className="aa-lightbox-count">{lightbox.index+1} / {lightbox.urls.length}</span></div>}
    {authOpen && <div className="aa-auth-backdrop" role="presentation" onClick={() => setAuthOpen(false)}><section className="aa-auth-modal" role="dialog" aria-modal="true" aria-label="Sign in" onClick={(e) => e.stopPropagation()}><button type="button" className="aa-auth-close" onClick={() => setAuthOpen(false)} aria-label="Close">×</button><div className="aa-auth-symbol">அ</div><h2>Join the conversation</h2><p>Sign in to publish discussions, vote and comment.</p><Link href="/auth/login">Continue to sign in ↗</Link><button type="button" className="aa-google-login" onClick={() => {window.location.href="/auth/login?provider=Google";}}>Continue with Google</button></section></div>}
  </main>;
}
