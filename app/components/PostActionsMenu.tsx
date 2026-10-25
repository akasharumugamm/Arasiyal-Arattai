"use client";

import { useState } from "react";

type PostActionsMenuProps = {
  postId: string;
  canDelete: boolean;
  onDeleted: (postId: string) => void;
};

export default function PostActionsMenu({ postId, canDelete, onDeleted }: PostActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function deletePost() {
    if (!canDelete || deleting) return;
    if (!window.confirm("Delete this post? This will remove it from public discussions.")) return;

    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/reviews/${postId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not delete this post.");
      setOpen(false);
      onDeleted(postId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this post.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="aa-post-menu">
      <button
        type="button"
        className="aa-post-menu-trigger"
        aria-label="Post options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => { setOpen((value) => !value); setError(""); }}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
        </svg>
      </button>
      {open && (
        <>
          <button type="button" className="aa-post-menu-dismiss" aria-label="Close post menu" onClick={() => setOpen(false)} />
          <div className="aa-post-menu-popover" role="menu">
            <button type="button" role="menuitem" className="aa-post-menu-item is-unavailable" disabled title="Share will be added later">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4" />
              </svg>
              <span>Share</span>
              <small>Coming soon</small>
            </button>
            {canDelete && (
              <button type="button" role="menuitem" className="aa-post-menu-item is-danger" onClick={() => void deletePost()} disabled={deleting}>
                <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
                </svg>
                <span>{deleting ? "Deleting…" : "Delete post"}</span>
              </button>
            )}
            {error && <p className="aa-post-menu-error" role="alert">{error}</p>}
          </div>
        </>
      )}
    </div>
  );
}
