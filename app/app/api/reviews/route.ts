import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

type CognitoClaims = { sub?: string; email?: string; name?: string; preferred_username?: string; username?: string };
type OfficialInput = { name: string; category?: string };

async function getClaims(request: NextRequest): Promise<CognitoClaims | null> {
  const token = request.cookies.get("tge_access_token")?.value;
  const domain = process.env.COGNITO_DOMAIN?.replace(/\/$/, "");
  if (!token || !domain) return null;
  const response = await fetch(`${domain}/oauth2/userInfo`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
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
       display_name = COALESCE(app_users.display_name, EXCLUDED.display_name),
       username = COALESCE(app_users.username, EXCLUDED.username),
       updated_at = now()
     RETURNING id`,
    [claims.sub, claims.email ?? null, claims.name ?? null, claims.preferred_username ?? claims.username ?? null],
  );
  return result.rows[0].id;
}

const REVIEW_TYPES = ["Positive", "Concern", "Allegation", "Request"] as const;

export async function GET(request: NextRequest) {
  try {
    let viewerId: string | null = null;
    try {
      const claims = await getClaims(request);
      if (claims) viewerId = await ensureUser(claims);
    } catch { /* Public listing remains available if optional authentication fails. */ }

    const official = request.nextUrl.searchParams.get("profile")?.trim();
    const type = request.nextUrl.searchParams.get("type");
    const values: unknown[] = [viewerId];
    const filters = ["p.deleted_at IS NULL"];
    if (official) {
      values.push(official);
      filters.push(`EXISTS (SELECT 1 FROM review_post_officials po WHERE po.post_id = p.id AND po.official_name = $${values.length})`);
    }
    if (type && REVIEW_TYPES.includes(type as typeof REVIEW_TYPES[number])) {
      values.push(type);
      filters.push(`p.review_type = $${values.length}`);
    }

    const result = await query(
      `SELECT p.id, p.author_id AS "authorId", p.review_type AS type, p.title, p.body, p.created_at AS date,
              COALESCE(u.display_name, u.username, 'User') AS name,
              COALESCE((SELECT json_agg(json_build_object('name', po.official_name, 'category', po.official_category) ORDER BY po.official_name)
                        FROM review_post_officials po WHERE po.post_id = p.id), '[]'::json) AS officials,
              COALESCE((SELECT json_agg(ri.image_url ORDER BY ri.sort_order)
                        FROM review_images ri WHERE ri.post_id = p.id), '[]'::json) AS "imageUrls",
              json_build_object(
                'up', (SELECT COUNT(*)::int FROM review_votes v WHERE v.post_id = p.id AND v.direction = 'up'),
                'down', (SELECT COUNT(*)::int FROM review_votes v WHERE v.post_id = p.id AND v.direction = 'down')
              ) AS votes,
              (SELECT direction FROM review_votes myv WHERE myv.post_id = p.id AND myv.voter_id = $1 LIMIT 1) AS "myVote",
              COALESCE(p.author_id = $1, false) AS "canDelete",
              (SELECT COUNT(*)::int FROM review_comments c WHERE c.post_id = p.id AND c.deleted_at IS NULL) AS "commentCount"
       FROM review_posts p
       JOIN app_users u ON u.id = p.author_id
       WHERE ${filters.join(" AND ")}
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
  try { claims = await getClaims(request); }
  catch { return NextResponse.json({ error: "Authentication could not be verified" }, { status: 503 }); }
  if (!claims) return NextResponse.json({ error: "Sign in to publish feedback" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Expected JSON request body" }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid review" }, { status: 400 });

  const input = body as Record<string, unknown>;
  const type = input.type;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const reviewBody = typeof input.body === "string" ? input.body.trim() : "";
  const officials = Array.isArray(input.officials) ? input.officials as OfficialInput[] : [];
  const imageUrls = Array.isArray(input.imageUrls) ? input.imageUrls : [];
  const cleanOfficials = officials
    .filter((item) => item && typeof item.name === "string" && item.name.trim())
    .map((item) => ({ name: item.name.trim(), category: typeof item.category === "string" ? item.category.trim().slice(0, 40) : "Other" }))
    .filter((item, index, list) => list.findIndex((candidate) => candidate.name.toLowerCase() === item.name.toLowerCase()) === index);
  const cleanImages = imageUrls.filter((url): url is string => typeof url === "string" && url.length <= 2048);

  if (!cleanOfficials.length || cleanOfficials.length > 30 ||
      typeof type !== "string" || !REVIEW_TYPES.includes(type as typeof REVIEW_TYPES[number]) ||
      !title || title.length > 200 || !reviewBody || reviewBody.length > 10000 ||
      !Array.isArray(input.officials) || cleanImages.length !== imageUrls.length || cleanImages.length > 4) {
    return NextResponse.json({ error: "Add at least one official, choose a category, enter a title and details, and attach no more than four valid images." }, { status: 400 });
  }

  try {
    const userId = await ensureUser(claims);
    const authorResult = await query<{ display_name: string | null; username: string | null }>("SELECT display_name, username FROM app_users WHERE id = $1", [userId]);
    const authorName = authorResult.rows[0]?.display_name ?? authorResult.rows[0]?.username ?? "User";
    const created = await query<{ id: string; date: string }>(
      `INSERT INTO review_posts (author_id, review_type, title, body)
       VALUES ($1, $2, $3, $4) RETURNING id, created_at AS date`,
      [userId, type, title, reviewBody],
    );
    const postId = created.rows[0].id;
    for (const official of cleanOfficials) {
      await query("INSERT INTO review_post_officials (post_id, official_name, official_category) VALUES ($1, $2, $3)", [postId, official.name, official.category || "Other"]);
    }
    for (const [index, imageUrl] of cleanImages.entries()) {
      await query("INSERT INTO review_images (post_id, image_url, sort_order) VALUES ($1, $2, $3)", [postId, imageUrl, index]);
    }
    const review = {
      id: postId, type, title, body: reviewBody, date: created.rows[0].date,
      name: authorName, authorId: userId, canDelete: true, officials: cleanOfficials,
      imageUrls: cleanImages, votes: { up: 0, down: 0 }, myVote: null, commentCount: 0,
    };
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Failed to save review:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Could not save review to the database" }, { status: 503 });
  }
}
