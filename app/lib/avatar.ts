export type AvatarColors = { background: string; foreground: string; border: string };

const AVATAR_PALETTE: AvatarColors[] = [
  { background: "#E0E7FF", foreground: "#3730A3", border: "#C7D2FE" },
  { background: "#FCE7F3", foreground: "#9D174D", border: "#FBCFE8" },
  { background: "#D1FAE5", foreground: "#065F46", border: "#A7F3D0" },
  { background: "#FEF3C7", foreground: "#92400E", border: "#FDE68A" },
  { background: "#DBEAFE", foreground: "#1D4ED8", border: "#BFDBFE" },
  { background: "#F3E8FF", foreground: "#6B21A8", border: "#E9D5FF" },
  { background: "#FFE4E6", foreground: "#9F1239", border: "#FECDD3" },
  { background: "#CCFBF1", foreground: "#115E59", border: "#99F6E4" },
  { background: "#FFEDD5", foreground: "#9A3412", border: "#FED7AA" },
  { background: "#E2E8F0", foreground: "#334155", border: "#CBD5E1" },
  { background: "#FDE68A", foreground: "#78350F", border: "#FCD34D" },
  { background: "#EDE9FE", foreground: "#5B21B6", border: "#DDD6FE" },
];

/** Stable Google-style fallback avatar colors: the same identity always maps to the same palette entry. */
export function getAvatarColors(identity?: string | null): AvatarColors {
  const normalized = (identity ?? "").trim().toLocaleLowerCase();
  if (!normalized) return AVATAR_PALETTE[0];
  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return AVATAR_PALETTE[(hash >>> 0) % AVATAR_PALETTE.length];
}

export function getAvatarInitials(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
}
