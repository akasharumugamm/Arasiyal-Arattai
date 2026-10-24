"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Profile = { id: string; name: string; email?: string; username?: string };
type Post = {
  id: string; authorId: string; name: string; type: "Positive" | "Concern" | "Allegation" | "Request";
  title: string; body: string; date: string; officials: { name: string; category: string }[];
  imageUrls: string[]; votes: { up: number; down: number };
};
const typeColors: Record<Post["type"], { color: string; background: string }> = {
  Positive: { color: "#166534", background: "#dcfce7" },
  Concern: { color: "#92400e", background: "#fef3c7" },
  Allegation: { color: "#991b1b", background: "#fee2e2" },
  Request: { color: "#1d4ed8", background: "#dbeafe" },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [profileResponse, postsResponse] = await Promise.all([
          fetch("/api/profile", { cache: "no-store" }),
          fetch("/api/reviews", { cache: "no-store" }),
        ]);
        if (!profileResponse.ok) { if (!cancelled) setSignedOut(true); return; }
        const profileData = await profileResponse.json();
        const postsData = await postsResponse.json();
        if (cancelled) return;
        const loadedProfile = profileData.profile as Profile;
        setProfile(loadedProfile);
        setName(loadedProfile.name ?? "");
        const authored = (Array.isArray(postsData.reviews) ? postsData.reviews : [])
          .filter((post: Post) => post.authorId === loadedProfile.id) as Post[];
        setPosts(authored);
      } catch {
        if (!cancelled) setNotice("Could not load your profile. Please refresh and try again.");
      } finally { if (!cancelled) setLoading(false); }
    }
    queueMicrotask(() => { void load(); });
    return () => { cancelled = true; };
  }, []);

  async function saveName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setNotice("");
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save your display name");
      setProfile((current) => current ? { ...current, name: data.profile.name } : current);
      setName(data.profile.name);
      setNotice("Your public display name is saved and will be used on future discussions.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save your name"); }
    finally { setSaving(false); }
  }

  if (loading) return <main className="aa-page"><div className="aa-empty">Loading your profile…</div></main>;
  if (signedOut || !profile) return <main className="aa-page"><section className="aa-auth-modal"><h1>Sign in required</h1><p>Sign in to manage your public display name and discussions.</p><Link href="/auth/login">Continue to sign in ↗</Link><Link href="/" className="aa-back-link">Back to Explorer</Link></section></main>;

  return <main className="aa-page">
    <header className="aa-topbar"><Link href="/" className="aa-brand"><span className="aa-brand-mark">அ</span><span><strong>அரசியல் அரட்டை</strong><small>ARASIYAL ARATTAI</small></span></Link><Link href="/reviews" className="aa-back-link">Public discussions</Link></header>
    <div className="aa-profile-layout">
      <section className="aa-profile-card"><span className="aa-eyebrow">YOUR ACCOUNT</span><h1>Your profile</h1><p className="aa-profile-email">{profile.email || "Signed in with Cognito"}</p>
        <form onSubmit={saveName} className="aa-profile-form"><label htmlFor="aa-profile-name">Public display name</label><p>This name appears next to your public discussions and comments.</p><input id="aa-profile-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={60} required /><button type="submit" disabled={saving}>{saving ? "Saving…" : "Save display name"}</button></form>
        {notice && <p role="status" className="aa-profile-notice">{notice}</p>}
      </section>
      <section className="aa-profile-posts"><div className="aa-feed-heading"><div><span className="aa-eyebrow">YOUR CONTRIBUTIONS</span><h2>Your discussions</h2><p>Posts you have published across the directory.</p></div><span className="aa-feed-count">{posts.length} posts</span></div>
        {posts.length === 0 ? <div className="aa-empty"><span>✦</span><h3>No discussions yet</h3><p>Share a constructive observation, raise a concern or request action.</p><Link href="/reviews?action=write">Start a discussion ↗</Link></div> :
          <div className="aa-profile-post-list">{posts.map((post) => { const style = typeColors[post.type]; return <article key={post.id} className="aa-post"><span className="aa-type-pill" style={{ color: style.color, background: style.background }}>{post.type}</span><h3>{post.title}</h3><p className="aa-post-body">{post.body}</p><div className="aa-tagged-officials">{post.officials?.map((official) => <span key={official.name}>{official.name}</span>)}</div>{post.imageUrls?.length > 0 && <div className="home-review-images">{post.imageUrls.map((url) => <img key={url} src={url} alt="Discussion attachment" />)}</div>}<small className="aa-profile-post-date">{new Date(post.date).toLocaleString()}</small></article>; })}</div>}
      </section>
    </div>
  </main>;
}
