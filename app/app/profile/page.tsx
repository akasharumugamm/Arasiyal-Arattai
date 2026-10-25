"use client";

import Link from "next/link";
import PostActionsMenu from "@/components/PostActionsMenu";
import { useEffect, useState } from "react";

type Profile = { id: string; name: string; email?: string; username?: string };
type Post = {
  id: string; authorId: string; name: string; type: "Positive" | "Concern" | "Allegation" | "Request";
  title: string; body: string; date: string; officials: { name: string; category: string }[];
  imageUrls: string[]; votes: { up: number; down: number }; myVote?: "up" | "down" | null; commentCount?: number;
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

  async function votePost(post: Post, direction: "up" | "down") {
    try {
      const response = await fetch(`/api/reviews/${post.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ direction }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Vote could not be saved");
      setPosts((current) => current.map((item) => item.id === post.id
        ? { ...item, myVote: direction, votes: { up: data.upvotes ?? 0, down: data.downvotes ?? 0 } }
        : item));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Vote could not be saved");
    }
  }

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
    <header className="app-header app-header-visible aa-profile-home-header">
      <Link href="/" className="aa-profile-home-brand">
        <img src="/aa-logo.svg" alt="Arasiyal Arattai logo" />
        <span className="brand-heading">Arasiyal Arattai</span>
      </Link>
      <Link href="/reviews" className="aa-profile-discussions-link">Public discussions</Link>
    </header>
    <div className="aa-profile-layout">
      <section className="aa-profile-card"><span className="aa-eyebrow">YOUR ACCOUNT</span><h1>Your profile</h1><p className="aa-profile-email">{profile.email || "Signed in with Cognito"}</p>
        <form onSubmit={saveName} className="aa-profile-form"><label htmlFor="aa-profile-name">Public display name</label><p>This name appears next to your public discussions and comments.</p><input id="aa-profile-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={60} required /><button type="submit" disabled={saving}>{saving ? "Saving…" : "Save display name"}</button></form>
        {notice && <p role="status" className="aa-profile-notice">{notice}</p>}
      </section>
      <section className="aa-profile-posts"><div className="aa-feed-heading"><div><span className="aa-eyebrow">YOUR CONTRIBUTIONS</span><h2>Your discussions</h2><p>Posts you have published across the directory.</p></div><span className="aa-feed-count">{posts.length} posts</span></div>
        {posts.length === 0 ? <div className="aa-empty"><span>✦</span><h3>No discussions yet</h3><p>Share a constructive observation, raise a concern or request action.</p><Link href="/reviews?action=write">Start a discussion ↗</Link></div> :
          <div className="aa-profile-post-list">{posts.map((post) => {
            const style = typeColors[post.type];
            const initials = (post.name || profile.name || "U").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
            return <article key={post.id} className="aa-social-post aa-profile-post">
              <div className="aa-social-post-main">
                <div className="aa-social-post-header">
                  <div className="aa-social-avatar">{initials}</div>
                  <div className="aa-social-author"><strong>{post.name || profile.name}</strong><span>{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
                  <span className="aa-social-flair" style={{ color: style.color, background: style.background }}>{post.type}</span><PostActionsMenu postId={post.id} canDelete={post.authorId === profile.id} onDeleted={(id) => setPosts((current) => current.filter((item) => item.id !== id))} />
                </div>
                {post.imageUrls?.length ? null : <div className="aa-social-officials">{post.officials?.map((official) => <Link key={official.name} href={`/?profile=${encodeURIComponent(official.name)}`}>{official.name}</Link>)}</div>}
                <h3 className="aa-social-title">{post.title}</h3>
                <p className="aa-social-body">{post.body}</p>
                {post.imageUrls?.length > 0 && <div className={`aa-social-media media-${Math.min(post.imageUrls.length, 4)}`}>{post.imageUrls.slice(0, 4).map((url) => <img key={url} src={url} alt={`Discussion attachment: ${post.title}`} loading="lazy" />)}</div>}
                {post.imageUrls?.length > 0 && post.officials?.length > 0 ? <div className="aa-social-officials">{post.officials.map((official) => <Link key={official.name} href={`/?profile=${encodeURIComponent(official.name)}`}>{official.name}</Link>)}</div> : null}
                <div className="aa-social-actions">
                  <div className="aa-social-votes">
                    <button type="button" className={post.myVote === "up" ? "is-upvoted" : ""} aria-label="Upvote post" aria-pressed={post.myVote === "up"} onClick={() => void votePost(post, "up")}><svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.2 4.8 10.7h4.1v8.8h6.2v-8.8h4.1L12 3.2Z" /></svg><span className="aa-social-vote-count">{post.votes?.up ?? 0}</span></button>
                    <button type="button" className={post.myVote === "down" ? "is-downvoted" : ""} aria-label="Downvote post" aria-pressed={post.myVote === "down"} onClick={() => void votePost(post, "down")}><svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.8 4.8 13.3h4.1V4.5h6.2v8.8h4.1L12 20.8Z" /></svg><span className="aa-social-vote-count">{post.votes?.down ?? 0}</span></button>
                  </div>
                  <Link href="/reviews" className="aa-social-comment-button" aria-label={`View ${post.commentCount ?? 0} comments`}><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9.6 21.56a.72.72 0 0 1-.51-.21.72.72 0 0 1-.21-.51v-3.16H6.5a3.62 3.62 0 0 1-3.62-3.62V6.06A3.62 3.62 0 0 1 6.5 2.44h11a3.62 3.62 0 0 1 3.62 3.62v8a3.62 3.62 0 0 1-3.62 3.62h-3.26l-4.16 3.7a.8.8 0 0 1-.48.18ZM6.5 3.68a2.38 2.38 0 0 0-2.38 2.38v8a2.38 2.38 0 0 0 2.38 2.38h3.62v3.22l3.64-3.22h3.74a2.38 2.38 0 0 0 2.38-2.38v-8a2.38 2.38 0 0 0-2.38-2.38h-11Z"/></svg><span className="aa-social-comment-count">{post.commentCount ?? 0}</span></Link>
                </div>
              </div>
            </article>;
          })}</div>}
      </section>
    </div>
  </main>;
}
