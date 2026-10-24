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
async function getUserId(claims: Claims) {
  const result = await query<{ id: string; display_name: string | null; username: string | null; email: string | null }>(
    `INSERT INTO app_users (cognito_sub, email, display_name, username) VALUES ($1,$2,$3,$4)
     ON CONFLICT (cognito_sub) DO UPDATE SET
       email = COALESCE(EXCLUDED.email, app_users.email),
       display_name = COALESCE(app_users.display_name, EXCLUDED.display_name),
       username = COALESCE(app_users.username, EXCLUDED.username),
       updated_at = now()
     RETURNING id, display_name, username, email`,
    [claims.sub, claims.email ?? null, claims.name ?? null, claims.preferred_username ?? claims.username ?? null],
  );
  return result.rows[0];
}
export async function GET(request: NextRequest) {
  try {
    const claims = await getClaims(request);
    if (!claims) return NextResponse.json({ error: "Sign in to view your profile" }, { status: 401 });
    const user = await getUserId(claims);
    return NextResponse.json({ profile: { id: user.id, name: user.display_name ?? user.username ?? "User", username: user.username, email: user.email } });
  } catch (error) {
    console.error("Could not load profile:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Could not load profile" }, { status: 503 });
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const claims = await getClaims(request);
    if (!claims) return NextResponse.json({ error: "Sign in to update your profile" }, { status: 401 });
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Expected JSON body" }, { status: 400 }); }
    const name = body && typeof body === "object" && typeof (body as Record<string, unknown>).name === "string"
      ? ((body as Record<string, unknown>).name as string).trim() : "";
    if (name.length < 2 || name.length > 60) return NextResponse.json({ error: "Display name must be between 2 and 60 characters" }, { status: 400 });
    const user = await getUserId(claims);
    const result = await query<{ display_name: string }>(
      "UPDATE app_users SET display_name = $1, updated_at = now() WHERE id = $2 RETURNING display_name",
      [name, user.id],
    );
    return NextResponse.json({ profile: { name: result.rows[0].display_name } });
  } catch (error) {
    console.error("Could not update profile:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Could not update profile" }, { status: 503 });
  }
}
