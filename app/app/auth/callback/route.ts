import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const expectedState = request.cookies.get("tge_oauth_state")?.value;
  const oauthError = searchParams.get("error");

  const redirectWithError = (reason: string) => {
    const response = NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(reason)}`, origin),
    );
    response.cookies.delete("tge_oauth_state");
    return response;
  };

  // Prevent login CSRF by checking the state generated before redirecting to Cognito.
  if (!expectedState || !returnedState || returnedState !== expectedState) {
    return redirectWithError("invalid_state");
  }

  if (oauthError) {
    return redirectWithError("oauth");
  }

  if (!code) {
    return redirectWithError("missing_code");
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
      return redirectWithError("token_exchange");
    }

    const tokens = (await tokenResponse.json()) as {
      access_token?: string;
      id_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };

    if (!tokens.access_token || !tokens.id_token) {
      return redirectWithError("invalid_token_response");
    }

    const response = NextResponse.redirect(new URL("/", origin));
    const cookieOptions = {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax" as const,
      path: "/",
    };

    response.cookies.delete("tge_oauth_state");
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
    return redirectWithError("callback");
  }
}
