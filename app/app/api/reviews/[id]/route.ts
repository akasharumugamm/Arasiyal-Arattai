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
    [claims.sub, claims.email ?? null, claims.name ?? null, claims.preferred_username ?? claims.username ?? null],
  );
  return result.rows[0].id;
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  let claims: CognitoClaims | null;
  try {
    claims = await getClaims(request);
  } catch {
    return NextResponse.json({ error: "Authentication could not be verified" }, { status: 503 });
  }
  if (!claims) return NextResponse.json({ error: "Sign in to delete a post" }, { status: 401 });

  const { id: postId } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(postId)) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }

  try {
    const userId = await ensureUser(claims);
    const result = await query<{ id: string }>(
      `UPDATE review_posts
       SET deleted_at = now(), updated_at = now()
       WHERE id = $1 AND author_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [postId, userId],
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Post not found or you do not have permission to delete it" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Failed to delete review:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Could not delete this post" }, { status: 503 });
  }
}
