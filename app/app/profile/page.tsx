"use client";

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

  if (loading) return <main className="aa-page"><div className="aa-empty">Loading your profile…</div></main>;
  if (signedOut || !profile) return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Arasiyal Arattai</p>
        <h1 className="brand-heading mt-3 text-2xl font-black">Sign in to Arasiyal Arattai</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Sign in securely to manage your public display name and discussions.</p>
        <a href="/auth/login" className="mt-6 flex w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Continue with Cognito</a>
        <a href="/auth/login?provider=Google" className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Continue with Google</a>
        <p className="mt-4 text-xs leading-5 text-slate-500">You will be redirected to Amazon Cognito or Google to sign in or create an account.</p>
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 text-sm">
          <Link href="/" className="font-medium text-slate-600 hover:text-slate-900">Back to Explorer</Link>
          <Link href="/login" className="font-medium text-blue-700 hover:text-blue-900">Main sign-in page</Link>
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
            <div className="aa-profile-monogram" aria-label="Arasiyal Arattai profile" style={{ background: getAvatarColors(profile.name).background, color: getAvatarColors(profile.name).foreground, borderColor: getAvatarColors(profile.name).border }}>AA</div>
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
                  <span className="aa-social-flair" style={{ color: style.color, background: style.background }}>{post.type}</span><PostActionsMenu postId={post.id} canDelete={post.authorId === profile.id} onDeleted={(id) => setPosts((current) => current.filter((item) => item.id !== id))} />
                </div>
                {post.imageUrls?.length ? null : <div className="aa-social-officials">{post.officials?.map((official) => <Link key={official.name} href={`/?profile=${encodeURIComponent(official.name)}`}>{official.name}</Link>)}</div>}
                <h3 className="aa-social-title">{post.title}</h3>
                <p className="aa-social-body">{post.body}</p>
                {post.imageUrls?.length > 0 && <div className={`aa-social-media media-${Math.min(post.imageUrls.length, 4)}`}>{post.imageUrls.slice(0, 4).map((url) => <img key={url} src={url} alt={`Discussion attachment: ${post.title}`} loading="lazy" />)}</div>}
                {post.imageUrls?.length > 0 && post.officials?.length > 0 ? <div className="aa-social-officials">{post.officials.map((official) => <Link key={official.name} href={`/?profile=${encodeURIComponent(official.name)}`}>{official.name}</Link>)}</div> : null}
                <div className="aa-social-actions">
                  <div className="aa-social-votes">
                    <button type="button" className={post.myVote === "up" ? "is-upvoted" : ""} aria-label="Upvote post" aria-pressed={post.myVote === "up"} onClick={() => void votePost(post, "up")}><svg aria-hidden="true" className="vote-icon" viewBox="0 0 18 19" width="18" height="19" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g transform={post.myVote === "up" ? "rotate(180 9 9.5)" : "none"}><path d={post.myVote === "up" ? "M9.00389 19C8.67056 19 8.39056 18.8733 8.16389 18.62L0.283889 9.88C0.137222 9.72 0.0472222 9.53 0.0138889 9.31C-0.0194444 9.09 0.00722223 8.87667 0.0938889 8.67C0.180556 8.46333 0.317222 8.3 0.503889 8.18C0.690556 8.06 0.897222 8 1.12389 8H4.88389V1.12C4.88389 0.813334 4.99389 0.549999 5.21389 0.33C5.43389 0.110001 5.69722 0 6.00389 0H12.0039C12.3106 0 12.5739 0.110001 12.7939 0.33C13.0139 0.549999 13.1239 0.813334 13.1239 1.12V8H16.8839C17.0972 8 17.2972 8.06 17.4839 8.18C17.6706 8.3 17.8106 8.46333 17.9039 8.67C17.9972 8.87667 18.0272 9.09 17.9939 9.31C17.9606 9.53 17.8706 9.72 17.7239 9.88L9.84389 18.62C9.61722 18.8733 9.33722 19 9.00389 19Z" : "M9.00316 0C9.33649 0 9.61649 0.126667 9.84316 0.38L17.7232 9.12C17.8698 9.28 17.9598 9.47 17.9932 9.69C18.0265 9.91 17.9998 10.1233 17.9132 10.33C17.8265 10.5367 17.6898 10.7 17.5032 10.82C17.3165 10.94 17.1098 11 16.8832 11H13.1232L13.1232 17.88C13.1232 18.1867 13.0132 18.45 12.7932 18.67C12.5732 18.89 12.3098 19 12.0032 19L6.00316 19C5.69649 19 5.43316 18.89 5.21316 18.67C4.99316 18.45 4.88316 18.1867 4.88316 17.88L4.88316 11L1.12316 11C0.909826 11 0.709826 10.94 0.523159 10.82C0.336493 10.7 0.196493 10.5367 0.103159 10.33C0.00982666 10.1233 -0.020174 9.91 0.0131588 9.69C0.0464916 9.47 0.136492 9.28 0.283159 9.12L8.16316 0.38C8.38983 0.126667 8.66983 0 9.00316 0ZM16.6032 9.74L9.00316 1.32L1.40316 9.74L6.12316 9.74L6.12316 17.76L11.8832 17.76L11.8832 9.76L16.6032 9.74Z"} /></g></svg><span className="aa-social-vote-count">{post.votes?.up ?? 0}</span></button>
                    <button type="button" className={post.myVote === "down" ? "is-downvoted" : ""} aria-label="Downvote post" aria-pressed={post.myVote === "down"} onClick={() => void votePost(post, "down")}><svg aria-hidden="true" className="vote-icon" viewBox="0 0 18 19" width="18" height="19" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g transform={post.myVote === "down" ? "none" : "rotate(180 9 9.5)"}><path d={post.myVote === "down" ? "M9.00389 19C8.67056 19 8.39056 18.8733 8.16389 18.62L0.283889 9.88C0.137222 9.72 0.0472222 9.53 0.0138889 9.31C-0.0194444 9.09 0.00722223 8.87667 0.0938889 8.67C0.180556 8.46333 0.317222 8.3 0.503889 8.18C0.690556 8.06 0.897222 8 1.12389 8H4.88389V1.12C4.88389 0.813334 4.99389 0.549999 5.21389 0.33C5.43389 0.110001 5.69722 0 6.00389 0H12.0039C12.3106 0 12.5739 0.110001 12.7939 0.33C13.0139 0.549999 13.1239 0.813334 13.1239 1.12V8H16.8839C17.0972 8 17.2972 8.06 17.4839 8.18C17.6706 8.3 17.8106 8.46333 17.9039 8.67C17.9972 8.87667 18.0272 9.09 17.9939 9.31C17.9606 9.53 17.8706 9.72 17.7239 9.88L9.84389 18.62C9.61722 18.8733 9.33722 19 9.00389 19Z" : "M9.00316 0C9.33649 0 9.61649 0.126667 9.84316 0.38L17.7232 9.12C17.8698 9.28 17.9598 9.47 17.9932 9.69C18.0265 9.91 17.9998 10.1233 17.9132 10.33C17.8265 10.5367 17.6898 10.7 17.5032 10.82C17.3165 10.94 17.1098 11 16.8832 11H13.1232L13.1232 17.88C13.1232 18.1867 13.0132 18.45 12.7932 18.67C12.5732 18.89 12.3098 19 12.0032 19L6.00316 19C5.69649 19 5.43316 18.89 5.21316 18.67C4.99316 18.45 4.88316 18.1867 4.88316 17.88L4.88316 11L1.12316 11C0.909826 11 0.709826 10.94 0.523159 10.82C0.336493 10.7 0.196493 10.5367 0.103159 10.33C0.00982666 10.1233 -0.020174 9.91 0.0131588 9.69C0.0464916 9.47 0.136492 9.28 0.283159 9.12L8.16316 0.38C8.38983 0.126667 8.66983 0 9.00316 0ZM16.6032 9.74L9.00316 1.32L1.40316 9.74L6.12316 9.74L6.12316 17.76L11.8832 17.76L11.8832 9.76L16.6032 9.74Z"} /></g></svg><span className="aa-social-vote-count">{post.votes?.down ?? 0}</span></button>
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
