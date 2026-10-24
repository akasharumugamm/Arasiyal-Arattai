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
       display_name = COALESCE(app_users.display_name, EXCLUDED.display_name),
       username = COALESCE(app_users.username, EXCLUDED.username),
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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  let claims: CognitoClaims | null;
  try {
    claims = await getClaims(request);
  } catch {
    return NextResponse.json({ error: "Authentication could not be verified" }, { status: 503 });
  }
  if (!claims) return NextResponse.json({ error: "Sign in to vote" }, { status: 401 });

  const { id: postId } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(postId)) {
    return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON request body" }, { status: 400 });
  }
  const direction = body && typeof body === "object"
    ? (body as Record<string, unknown>).direction
    : null;
  if (direction !== "up" && direction !== "down") {
    return NextResponse.json({ error: "Vote must be 'up' or 'down'" }, { status: 400 });
  }

  try {
    const userId = await ensureUser(claims);
    const result = await query(
      `INSERT INTO review_votes (post_id, voter_id, direction)
       SELECT p.id, $2, $3
       FROM review_posts p
       WHERE p.id = $1 AND p.deleted_at IS NULL
       ON CONFLICT (post_id, voter_id) DO UPDATE SET
         direction = EXCLUDED.direction,
         updated_at = now()
       RETURNING post_id AS "postId", direction`,
      [postId, userId, direction],
    );
    if (!result.rowCount) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const counts = await query(
      `SELECT
         COUNT(*) FILTER (WHERE direction = 'up')::int AS upvotes,
         COUNT(*) FILTER (WHERE direction = 'down')::int AS downvotes
       FROM review_votes WHERE post_id = $1`,
      [postId],
    );
    return NextResponse.json({ ...result.rows[0], ...counts.rows[0] });
  } catch (error) {
    console.error("Failed to save vote:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Could not save vote to the database" }, { status: 503 });
  }
}
