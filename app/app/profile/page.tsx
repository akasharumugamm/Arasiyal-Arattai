"use client";

import { ArrowBigUp, ArrowBigDown, MessageCircle } from "lucide-react";

import Link from "next/link";
import PostActionsMenu from "@/components/PostActionsMenu";
import { getAvatarColors, getAvatarInitials } from "@/lib/avatar";
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
  const [editingProfile, setEditingProfile] = useState(false);

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
      setEditingProfile(false);
      setNotice("Your display name has been updated.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save your name"); }
    finally { setSaving(false); }
  }

  if (loading) return (
    <main className="aa-profile-loading-screen" aria-live="polite" aria-busy="true">
      <section className="aa-profile-loading-card">
        <div className="aa-profile-loading-mark">
          <img src="/aa-logo.svg" alt="" />
        </div>
        <span className="aa-profile-loading-spinner" aria-hidden="true" />
        <h1>Loading your profile</h1>
        <p>Getting your account details ready…</p>
        <div className="aa-profile-loading-track" aria-hidden="true"><span /></div>
      </section>
    </main>
  );
  if (signedOut || !profile) return (
    <main className="aa-auth-screen">
      <section className="aa-auth-glass-card">
        <p className="aa-auth-eyebrow">Arasiyal Arattai</p>
        <h1 className="brand-heading aa-auth-title">Sign in to Arasiyal Arattai</h1>
        <p className="aa-auth-description">Sign in securely to manage your public display name and discussions.</p>
        <a href="/auth/login" className="aa-auth-primary">Continue to sign in <span aria-hidden="true">↗</span></a>
        <a href="/auth/login?provider=Google" className="aa-auth-secondary">Continue with Google</a>
        <div className="aa-auth-footer">
          <Link href="/" className="aa-auth-link">Back to Explorer</Link>
          <Link href="/login" className="aa-auth-link aa-auth-link-primary">Main sign-in page</Link>
        </div>
      </section>
    </main>
  );

  return <main className="aa-page">
    <header className="app-header app-header-visible aa-profile-home-header">
      <Link href="/" className="aa-profile-home-brand">
        <img src="/aa-logo.svg" alt="Arasiyal Arattai logo" />
        <span className="brand-heading">Arasiyal Arattai</span>
      </Link>
      <Link href="/reviews?action=write" className="app-share-feedback aa-profile-share-feedback">
        <span className="share-icon" aria-hidden="true">＋</span>
        <span>Share feedback</span>
      </Link>
    </header>
    <div className="aa-profile-layout">
      <section className="aa-profile-card aa-profile-summary-card">
        <div className="aa-profile-card-heading">
          <div className="aa-profile-heading-identity">
            <div className="aa-profile-monogram" aria-label={`${profile.name || "User"} initials`} style={{ background: getAvatarColors(profile.name).background, color: getAvatarColors(profile.name).foreground, borderColor: getAvatarColors(profile.name).border }}>{getAvatarInitials(profile.name)}</div>
            <div className="aa-profile-heading-copy">
                            <h1>Profile</h1>
              <p>Manage your account details</p>
            </div>
          </div>
          <button type="button" className="aa-profile-edit-trigger" aria-label={editingProfile ? "Close profile editor" : "Edit profile"} aria-expanded={editingProfile} onClick={() => { setEditingProfile((value) => !value); setName(profile.name ?? ""); setNotice(""); }}>
            {editingProfile ? <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg> : <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>}
          </button>
        </div>
        {!editingProfile ? <div className="aa-profile-details">
          <div className="aa-profile-detail-row"><span className="aa-profile-detail-icon"><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.4 3.1-5.2 7-5.2s6.3 1.8 7 5.2"/></svg></span><span className="aa-profile-detail-copy"><small>Display name</small><strong>{profile.name || "User"}</strong></span></div>
          <div className="aa-profile-detail-row"><span className="aa-profile-detail-icon"><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></span><span className="aa-profile-detail-copy"><small>Email address</small><strong>{profile.email || "No email available"}</strong></span></div>
        </div> : <form onSubmit={saveName} className="aa-profile-form aa-profile-edit-form">
          <label htmlFor="aa-profile-name">Display name</label>
          <input id="aa-profile-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={60} required autoComplete="name" />
          <label htmlFor="aa-profile-email">Email address</label>
          <input id="aa-profile-email" value={profile.email || ""} readOnly aria-describedby="aa-profile-email-note" />
          <p id="aa-profile-email-note" className="aa-profile-email-note">Email changes require account verification and aren’t available here yet.</p>
          <div className="aa-profile-edit-actions"><button type="button" className="aa-profile-cancel-button" onClick={() => { setEditingProfile(false); setName(profile.name ?? ""); setNotice(""); }}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div>
        </form>}
        {notice && <p role="status" className="aa-profile-notice">{notice}</p>}
      </section>
      <section className="aa-profile-posts"><div className="aa-feed-heading"><div><span className="aa-eyebrow">YOUR CONTRIBUTIONS</span><h2>Your discussions</h2><p>Posts you have published across the directory.</p></div></div>
        {posts.length === 0 ? <div className="aa-empty"><span>✦</span><h3>No discussions yet</h3><p>Share a constructive observation, raise a concern or request action.</p><Link href="/reviews?action=write">Start a discussion ↗</Link></div> :
          <div className="aa-profile-post-list">{posts.map((post) => {
            const style = typeColors[post.type];
            const initials = getAvatarInitials(post.name || profile.name);
            const avatarColors = getAvatarColors(post.name || profile.name);
            return <article key={post.id} className="aa-social-post aa-profile-post">
              <div className="aa-social-post-main">
                <div className="aa-social-post-header">
                  <div className="aa-social-avatar" style={{ background: avatarColors.background, color: avatarColors.foreground, borderColor: avatarColors.border }}>{initials}</div>
                  <div className="aa-social-author"><strong>{post.name || profile.name}</strong><span>{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
                  <span className="aa-social-flair" style={{ color: style.color, background: style.background }}><span className="aa-social-flair-dot" style={{ background: style.color }} />{post.type}</span><PostActionsMenu postId={post.id} canDelete={post.authorId === profile.id} onDeleted={(id) => setPosts((current) => current.filter((item) => item.id !== id))} />
                </div>
                <h3 className="aa-social-title">{post.title}</h3>
                <p className="aa-social-body">{post.body}</p>
                {post.imageUrls?.length > 0 && <div className={`aa-social-media media-${Math.min(post.imageUrls.length, 4)}`}>{post.imageUrls.slice(0, 4).map((url) => <img key={url} src={url} alt={`Discussion attachment: ${post.title}`} loading="lazy" />)}</div>}
                {post.officials?.length > 0 ? <div className="aa-social-officials">{post.officials.map((official, index) => <Link key={official.name} href={`/?profile=${encodeURIComponent(official.name)}`}>{official.name}{index < post.officials.length - 1 ? " · " : ""}</Link>)}</div> : null}
                <div className="aa-social-actions">
                  <div className="aa-social-vote-buttons">
                    <button type="button" className={`aa-post-action-button ${post.myVote === "up" ? "is-upvoted" : ""}`} aria-label="Upvote post" aria-pressed={post.myVote === "up"} onClick={() => void votePost(post, "up")}><ArrowBigUp className="h-4 w-4" /><span className="aa-social-vote-count">{post.votes?.up ?? 0}</span></button>
                    <button type="button" className={`aa-post-action-button ${post.myVote === "down" ? "is-downvoted" : ""}`} aria-label="Downvote post" aria-pressed={post.myVote === "down"} onClick={() => void votePost(post, "down")}><ArrowBigDown className="h-4 w-4" /><span className="aa-social-vote-count">{post.votes?.down ?? 0}</span></button>
                  </div>
                  <Link href="/reviews" className="aa-social-comment-button aa-post-action-button" aria-label={`View ${post.commentCount ?? 0} comments`}><MessageCircle className="h-4 w-4" /><span className="aa-social-comment-count">{post.commentCount ?? 0}</span></Link>
                </div>
              </div>
            </article>;
          })}</div>}
      </section>
    </div>
  </main>;
}
