import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

type CognitoClaims = {
  sub?: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  username?: string;
};

async function getClaims(request: NextRequest): Promise<CognitoClaims | null> {
  const token = request.cookies.get("tge_access_token")?.value;
  const domain = process.env.COGNITO_DOMAIN?.replace(/\/$/, "");
  if (!token || !domain) return null;

  const response = await fetch(`${domain}/oauth2/userInfo`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const claims = (await response.json()) as CognitoClaims;
  return claims.sub ? claims : null;
}

async function ensureUser(claims: CognitoClaims): Promise<string> {
  const result = await query<{ id: string }>(
    `INSERT INTO app_users (cognito_sub, email, display_name, username)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (cognito_sub) DO UPDATE SET
       email = COALESCE(EXCLUDED.email, app_users.email),
       display_name = COALESCE(EXCLUDED.display_name, app_users.display_name),
       username = COALESCE(EXCLUDED.username, app_users.username),
       updated_at = now()
     RETURNING id`,
    [
      claims.sub,
      claims.email ?? null,
      claims.name ?? null,
      claims.preferred_username ?? claims.username ?? null,
    ],
  );
  return result.rows[0].id;
}

export async function GET(request: NextRequest) {
  try {
    const profile = request.nextUrl.searchParams.get("profile");
    const type = request.nextUrl.searchParams.get("type");
    const values: unknown[] = [];
    const filters = ["p.deleted_at IS NULL"];
    if (profile) {
      values.push(profile);
      filters.push(`p.profile_name = $${values.length}`);
    }
    if (type && ["Positive", "Negative", "Allegation", "Request"].includes(type)) {
      values.push(type);
      filters.push(`p.review_type = $${values.length}`);
    }

    const result = await query(
      `SELECT p.id, p.profile_name AS profile, p.review_type AS type,
              p.title, p.body, p.image_url AS image, p.created_at AS date,
              u.display_name AS name, u.username,
              COUNT(v.post_id) FILTER (WHERE v.direction = 'up')::int AS upvotes,
              COUNT(v.post_id) FILTER (WHERE v.direction = 'down')::int AS downvotes
       FROM review_posts p
       JOIN app_users u ON u.id = p.author_id
       LEFT JOIN review_votes v ON v.post_id = p.id
       WHERE ${filters.join(" AND ")}
       GROUP BY p.id, u.display_name, u.username
       ORDER BY p.created_at DESC
       LIMIT 200`,
      values,
    );

    return NextResponse.json({ reviews: result.rows });
  } catch (error) {
    console.error("Failed to load reviews:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Could not load reviews" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  let claims: CognitoClaims | null;
  try {
    claims = await getClaims(request);
  } catch {
    return NextResponse.json({ error: "Authentication could not be verified" }, { status: 503 });
  }
  if (!claims) return NextResponse.json({ error: "Sign in to publish feedback" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON request body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const profile = typeof input.profile === "string" ? input.profile.trim() : "";
  const type = input.type;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const reviewBody = typeof input.body === "string" ? input.body.trim() : "";
  const image = input.image;

  if (!profile || profile.length > 200 ||
      typeof type !== "string" || !["Positive", "Negative", "Allegation", "Request"].includes(type) ||
      !title || title.length > 200 ||
      !reviewBody || reviewBody.length > 10000 ||
      (image !== undefined && image !== null && (typeof image !== "string" || image.length > 2048))) {
    return NextResponse.json({ error: "Please provide a valid profile, type, title, and feedback (maximum 10,000 characters)" }, { status: 400 });
  }

  try {
    const userId = await ensureUser(claims);
    const result = await query(
      `INSERT INTO review_posts (author_id, profile_name, review_type, title, body, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, profile_name AS profile, review_type AS type, title, body,
                 image_url AS image, created_at AS date`,
      [userId, profile, type, title, reviewBody, typeof image === "string" ? image : null],
    );
    return NextResponse.json({ review: { ...result.rows[0], name: claims.name ?? claims.username ?? "User", upvotes: 0, downvotes: 0 } }, { status: 201 });
  } catch (error) {
    console.error("Failed to save review:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Could not save review to the database" }, { status: 503 });
  }
}
