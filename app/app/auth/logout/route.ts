import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const domain = process.env.COGNITO_DOMAIN?.replace(/\/$/, "");
  const clientId = process.env.COGNITO_CLIENT_ID;
  const signoutUrl = process.env.COGNITO_SIGNOUT_URL;

  if (!domain || !clientId || !signoutUrl) {
    return new NextResponse(
      "Cognito sign-out is not configured. Set COGNITO_DOMAIN, COGNITO_CLIENT_ID, and COGNITO_SIGNOUT_URL in the server environment.",
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  const logoutUrl = new URL("/logout", domain);
  logoutUrl.searchParams.set("client_id", clientId);
  logoutUrl.searchParams.set("logout_uri", signoutUrl);

  const response = NextResponse.redirect(logoutUrl);
  for (const name of [
    "tge_access_token",
    "tge_id_token",
    "tge_refresh_token",
    "tge_oauth_state",
  ]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}
