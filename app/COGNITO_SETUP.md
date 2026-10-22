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

## Google sign-in

Google sign-in is federated through Cognito. The app does not call Google directly; `/auth/login?provider=Google` tells Cognito to use the Google identity provider.

1. In Google Cloud Console, create an OAuth 2.0 Web application client.
2. Add this exact authorized redirect URI, replacing the host with the deployed app host when needed:
   `https://<your-cognito-domain>/oauth2/idpresponse`
3. In Cognito User Pool **Sign-in > Social and external providers**, add Google.
4. Enter the Google client ID and client secret. Request the `openid`, `email`, and `profile` scopes.
5. In the Cognito app client login-page settings, enable both **Google** and **Cognito user pool** as identity providers.

The provider name is intentionally restricted to `Google` in the application route. If Google is not enabled in the app client, the Google button will fail at Cognito even though the application is configured correctly.

## Local Codespaces configuration

1. Copy `.env.example` to `.env.local`.
2. Replace `COGNITO_DOMAIN`, `COGNITO_CLIENT_ID`, and `COGNITO_CLIENT_SECRET` with values from Cognito.
3. Keep the callback and sign-out URLs identical to the URLs registered in Cognito.
4. Restart the Next.js dev server after changing environment variables.

Never commit `.env.local` or put Cognito secrets in `NEXT_PUBLIC_*` variables.

When using Codespaces, open the app and start sign-in from the same forwarded
`https://*.app.github.dev` host. Do not start from `http://localhost:3000` while
using a forwarded URL in `COGNITO_CALLBACK_URL`; the OAuth state cookie is
host-specific. If the client secret has been exposed, rotate it in Cognito and
update `.env.local`.

## Routes

- Start sign-in: `/auth/login`
- OAuth callback: `/auth/callback`
- Sign out: `/auth/logout`

The login route generates and stores an OAuth state value; the callback validates it before exchanging the authorization code. The callback stores tokens in HttpOnly cookies. Before production, add server-side token/session validation and refresh handling, and verify that protected routes and APIs authorize users instead of trusting the presence of cookies alone.
