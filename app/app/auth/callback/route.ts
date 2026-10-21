import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(new URL("/?auth_error=oauth", origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?auth_error=missing_code", origin));
  }

  const domain = process.env.COGNITO_DOMAIN?.replace(/\/$/, "");
  const clientId = process.env.COGNITO_CLIENT_ID;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;
  const callbackUrl = process.env.COGNITO_CALLBACK_URL;

  if (!domain || !clientId || !clientSecret || !callbackUrl) {
    return new NextResponse(
      "Cognito callback is not configured. Set COGNITO_DOMAIN, COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET, and COGNITO_CALLBACK_URL in the server environment.",
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenResponse = await fetch(`${domain}/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code,
        redirect_uri: callbackUrl,
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      console.error("Cognito token exchange failed with status", tokenResponse.status);
      return NextResponse.redirect(new URL("/?auth_error=token_exchange", origin));
    }

    const tokens = (await tokenResponse.json()) as {
      access_token?: string;
      id_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };

    if (!tokens.access_token || !tokens.id_token) {
      return NextResponse.redirect(new URL("/?auth_error=invalid_token_response", origin));
    }

    const response = NextResponse.redirect(new URL("/", origin));
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    response.cookies.set("tge_access_token", tokens.access_token, {
      ...cookieOptions,
      maxAge: Math.max(60, tokens.expires_in ?? 3600),
    });
    response.cookies.set("tge_id_token", tokens.id_token, {
      ...cookieOptions,
      maxAge: Math.max(60, tokens.expires_in ?? 3600),
    });

    if (tokens.refresh_token) {
      response.cookies.set("tge_refresh_token", tokens.refresh_token, {
        ...cookieOptions,
        maxAge: 5 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("Cognito callback failed", error);
    return NextResponse.redirect(new URL("/?auth_error=callback", origin));
  }
}
