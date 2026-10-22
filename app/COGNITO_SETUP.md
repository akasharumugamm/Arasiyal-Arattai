# Amazon Cognito setup

This app uses its existing server-side OAuth callback at `/auth/callback`; it does not require Auth.js.

## Cognito app client

In the Cognito User Pool app client's login pages settings, configure:

- Identity provider: Cognito user pool
- OAuth grant type: Authorization code grant
- OpenID Connect scopes: `openid`, `email`, `profile`
- Allowed callback URL: `https://didactic-fortnight-wrrjx9w464wwcr7p-3000.app.github.dev/auth/callback`
- Allowed sign-out URL: `https://didactic-fortnight-wrrjx9w464wwcr7p-3000.app.github.dev/`

Create/enable a Cognito domain for the User Pool. This implementation expects an app client with a client secret.

## Local Codespaces configuration

1. Copy `.env.example` to `.env.local`.
2. Replace `COGNITO_DOMAIN`, `COGNITO_CLIENT_ID`, and `COGNITO_CLIENT_SECRET` with values from Cognito.
3. Keep the callback and sign-out URLs identical to the URLs registered in Cognito.
4. Restart the Next.js dev server after changing environment variables.

Never commit `.env.local` or put Cognito secrets in `NEXT_PUBLIC_*` variables.

## Routes

- Start sign-in: `/auth/login`
- OAuth callback: `/auth/callback`
- Sign out: `/auth/logout`

The login route generates and stores an OAuth state value; the callback validates it before exchanging the authorization code. The callback stores tokens in HttpOnly cookies. Before production, add server-side token/session validation and refresh handling, and verify that protected routes and APIs authorize users instead of trusting the presence of cookies alone.
