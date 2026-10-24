import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

type Claims = { sub?: string; email?: string; name?: string; preferred_username?: string; username?: string };
async function getClaims(request: NextRequest): Promise<Claims | null> {
  const token = request.cookies.get("tge_access_token")?.value;
  const domain = process.env.COGNITO_DOMAIN?.replace(/\/$/, "");
  if (!token || !domain) return null;
  const response = await fetch(`${domain}/oauth2/userInfo`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) return null;
  const claims = await response.json() as Claims;
  return claims.sub ? claims : null;
}
async function ensureUser(claims: Claims) {
  const result = await query<{ id: string }>(
    `INSERT INTO app_users (cognito_sub,email,display_name,username) VALUES ($1,$2,$3,$4)
     ON CONFLICT (cognito_sub) DO UPDATE SET
       email = COALESCE(EXCLUDED.email,app_users.email),
       display_name = COALESCE(app_users.display_name,EXCLUDED.display_name),
       username = COALESCE(app_users.username,EXCLUDED.username),
       updated_at = now() RETURNING id`,
    [claims.sub, claims.email ?? null, claims.name ?? null, claims.preferred_username ?? claims.username ?? null],
  );
  return result.rows[0].id;
}
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
  try {
    const result = await query(
      `SELECT c.id, c.parent_comment_id AS "parentCommentId", c.body, c.created_at AS date,
              COALESCE(u.display_name,u.username,'User') AS name
       FROM review_comments c JOIN app_users u ON u.id = c.author_id
       WHERE c.post_id = $1 AND c.deleted_at IS NULL ORDER BY c.created_at ASC LIMIT 500`,
      [id],
    );
    return NextResponse.json({ comments: result.rows });
  } catch (error) {
    console.error("Could not load comments:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Could not load comments" }, { status: 503 });
  }
}
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  let claims: Claims | null;
  try { claims = await getClaims(request); } catch { return NextResponse.json({ error: "Authentication could not be verified" }, { status: 503 }); }
  if (!claims) return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Expected JSON body" }, { status: 400 }); }
  const body = input && typeof input === "object" && typeof (input as Record<string, unknown>).body === "string"
    ? ((input as Record<string, unknown>).body as string).trim() : "";
  const parentId = input && typeof input === "object" ? (input as Record<string, unknown>).parentCommentId : null;
  if (!body || body.length > 3000 || (parentId !== null && parentId !== undefined && (typeof parentId !== "string" || !/^[0-9a-f-]{36}$/i.test(parentId)))) {
    return NextResponse.json({ error: "Comment must be between 1 and 3,000 characters" }, { status: 400 });
  }
  try {
    const userId = await ensureUser(claims);
    const authorResult = await query<{ display_name: string | null; username: string | null }>("SELECT display_name, username FROM app_users WHERE id = $1", [userId]);
    const authorName = authorResult.rows[0]?.display_name ?? authorResult.rows[0]?.username ?? "User";
    const result = await query(
      `INSERT INTO review_comments (post_id, author_id, parent_comment_id, body)
       SELECT p.id, $2, CASE WHEN $4::uuid IS NULL THEN NULL ELSE c.id END, $3
       FROM review_posts p LEFT JOIN review_comments c ON c.id = $4::uuid AND c.post_id = p.id AND c.deleted_at IS NULL
       WHERE p.id = $1 AND p.deleted_at IS NULL
         AND ($4::uuid IS NULL OR c.id IS NOT NULL)
       RETURNING id, parent_comment_id AS "parentCommentId", body, created_at AS date`,
      [id, userId, body, parentId ?? null],
    );
    if (!result.rowCount) return NextResponse.json({ error: "Review or parent comment not found" }, { status: 404 });
    return NextResponse.json({ comment: { ...result.rows[0], name: authorName } }, { status: 201 });
  } catch (error) {
    console.error("Could not save comment:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Could not save comment" }, { status: 503 });
  }
}
