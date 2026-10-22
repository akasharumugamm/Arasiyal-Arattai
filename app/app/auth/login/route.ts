import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const domain = process.env.COGNITO_DOMAIN?.replace(/\/$/, "");
  const clientId = process.env.COGNITO_CLIENT_ID;
  const callbackUrl = process.env.COGNITO_CALLBACK_URL;

  if (!domain || !clientId || !callbackUrl) {
    return new NextResponse(
      "Cognito sign-in is not configured. Set COGNITO_DOMAIN, COGNITO_CLIENT_ID, and COGNITO_CALLBACK_URL in the server environment.",
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  let cognitoDomain: URL;
  try {
    cognitoDomain = new URL(domain);
  } catch {
    return new NextResponse("COGNITO_DOMAIN must be a valid HTTPS URL.", { status: 500 });
  }

  if (cognitoDomain.protocol !== "https:") {
    return new NextResponse("COGNITO_DOMAIN must use HTTPS.", { status: 500 });
  }

  const state = randomBytes(32).toString("hex");
  const authorizeUrl = new URL("/oauth2/authorize", cognitoDomain);
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizeUrl.searchParams.set("state", state);
  // Only allow explicitly supported identity providers from the app.
  if (request.nextUrl.searchParams.get("provider")?.toLowerCase() === "google") {
    authorizeUrl.searchParams.set("identity_provider", "Google");
  }

  const response = NextResponse.redirect(authorizeUrl);
  const isHttps = request.headers.get("x-forwarded-proto") === "https:" ||
    request.nextUrl.protocol === "https:";
  response.cookies.set("tge_oauth_state", state, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}
