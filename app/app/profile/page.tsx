"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AuthUser = { id: string; email?: string; name?: string; username?: string };
type Review = {
  id: string;
  profile: string;
  name: string;
  type: "Positive" | "Negative" | "Allegation" | "Request";
  title: string;
  body: string;
  image?: string;
  votes?: { up: number; down: number };
  date: string;
};

const typeStyles: Record<Review["type"], { color: string; background: string }> = {
  Positive: { color: "#166534", background: "#dcfce7" },
  Negative: { color: "#991b1b", background: "#fee2e2" },
  Allegation: { color: "#1d4ed8", background: "#dbeafe" },
  Request: { color: "#1d4ed8", background: "#dbeafe" },
};

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [posts, setPosts] = useState<Review[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      fetch("/api/auth/me", { cache: "no-store" })
        .then(async (response) => {
        if (!response.ok) throw new Error("not_authenticated");
        const result = (await response.json()) as { user: AuthUser };
        setUser(result.user);
        })
        .catch(() => setUser(null));

      await Promise.resolve();
      try {
        const saved = localStorage.getItem("tn-government-explorer-reviews-v1");
        setPosts(saved ? JSON.parse(saved) as Review[] : []);
      } catch {
        setPosts([]);
      }
    };
    void loadProfile();
  }, []);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <section className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Sign in required</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in before opening your profile.</p>
          <a href="/auth/login" className="mt-6 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white">Sign in</a>
        </section>
      </main>
    );
  }

  const displayName = user.name || user.username || user.email || "Community member";
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-blue-700">← Back to Explorer</Link>
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Your profile</p>
          <h1 className="mt-2 text-3xl font-bold">{displayName}</h1>
          <p className="mt-2 text-sm text-slate-600">{user.email || "Authenticated with Cognito"}</p>
        </section>
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">Your posts</h2>
          <p className="mt-1 text-sm text-slate-600">Posts created in this browser are shown here until the PostgreSQL API is connected.</p>
          {posts.length === 0 ? (
            <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">You have not created any posts yet.</p>
          ) : (
            <div className="mt-5 grid gap-3">
              {posts.map((post) => {
                const style = typeStyles[post.type];
                const initials = post.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
                return (
                <article key={post.id} style={{ border: "1px solid #e5e7eb", borderRadius: 15, padding: "17px 16px 13px", minWidth: 0, background: "white", boxShadow: "0 2px 8px #0f172a05" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: .2, color: style.color, background: style.background, borderRadius: 7, padding: "5px 8px" }}>{post.type}</span>
                    <span style={{ color: "#9ca3af", fontSize: 11, whiteSpace: "nowrap" }}>{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <h3 style={{ margin: "12px 0 5px", fontSize: 16, lineHeight: 1.4, fontWeight: 700, color: "#202124" }}>{post.title}</h3>
                  <p style={{ margin: "0 0 13px", color: "#6b7280", fontSize: 13, lineHeight: 1.65, overflowWrap: "anywhere" }}>{post.body}</p>
                  {post.image && <img src={post.image} alt={`Image attached to review: ${post.title}`} style={{ display: "block", margin: "10px 0 13px", maxWidth: "100%", maxHeight: 360, borderRadius: 11, border: "1px solid #e5e7eb", objectFit: "contain" }} />}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 10, paddingTop: 12, borderTop: "1px solid #f0f1f3" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                      <div aria-hidden="true" style={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", background: "#e5f0e9", color: "#326b4e", fontSize: 11, fontWeight: 900 }}>{initials}</div>
                      <div style={{ minWidth: 0 }}><p style={{ margin: 0, color: "#292d32", fontSize: 12, fontWeight: 700 }}>{post.name}</p><p style={{ margin: "3px 0 0", color: "#9ca3af", fontSize: 10, overflowWrap: "anywhere" }}>{post.profile}</p></div>
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "stretch", gap: 0, padding: 1, border: "1px solid #dbe4ef", borderRadius: 999, background: "#f8fafc", overflow: "hidden" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, minWidth: 48, color: "#475569", padding: "4px 8px", fontSize: 11, fontWeight: 700 }}><span style={{ fontSize: 14, lineHeight: 1 }}>↑</span><span>{post.votes?.up ?? 0}</span></span>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, minWidth: 48, color: "#475569", padding: "4px 8px", fontSize: 11, fontWeight: 700 }}><span style={{ fontSize: 14, lineHeight: 1 }}>↓</span><span>{post.votes?.down ?? 0}</span></span>
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
