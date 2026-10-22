import { NextRequest, NextResponse } from "next/server";

export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  username?: string;
};

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("tge_access_token")?.value;
  const domain = process.env.COGNITO_DOMAIN?.replace(/\/$/, "");

  if (!accessToken || !domain) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const response = await fetch(`${domain}/oauth2/userInfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const claims = (await response.json()) as {
      sub?: string;
      email?: string;
      name?: string;
      preferred_username?: string;
      username?: string;
    };

    if (!claims.sub) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user: AuthUser = {
      id: claims.sub,
      ...(claims.email ? { email: claims.email } : {}),
      ...(claims.name ? { name: claims.name } : {}),
      ...(claims.preferred_username || claims.username
        ? { username: claims.preferred_username ?? claims.username }
        : {}),
    };
    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    console.error("Cognito user info request failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ authenticated: false }, { status: 503 });
  }
}
