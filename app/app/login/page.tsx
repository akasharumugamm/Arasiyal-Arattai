"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="aa-auth-screen">
      <section className="aa-auth-glass-card">
        <p className="aa-auth-eyebrow">
          Arasiyal Arattai
        </p>
        <h1 className="brand-heading aa-auth-title">Sign in to Arasiyal Arattai</h1>
        <p className="aa-auth-description">
          Sign in securely to share public feedback and participate in the Arasiyal Arattai community.
        </p>

        <a
          href="/auth/login"
          className="aa-auth-primary"
        >
          Continue with Cognito
        </a>

        <a
          href="/auth/login?provider=Google"
          className="aa-auth-secondary"
        >
          Continue with Google
        </a>

        <div className="aa-auth-footer">
          <Link href="/" className="aa-auth-link">
            Back to Arasiyal Arattai
          </Link>
          <a href="/auth/logout" className="aa-auth-link aa-auth-link-primary">
            Sign out
          </a>
        </div>
      </section>
    </main>
  );
}
