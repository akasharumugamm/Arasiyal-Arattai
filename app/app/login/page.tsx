"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
          TN Government Explorer
        </p>
        <h1 className="mt-3 text-2xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Sign in securely with your account through Amazon Cognito.
        </p>

        <a
          href="/auth/login"
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Continue with Cognito
        </a>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          You will be redirected to Amazon Cognito to sign in or create an account.
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 text-sm">
          <Link href="/" className="font-medium text-slate-600 hover:text-slate-900">
            Back to Explorer
          </Link>
          <a href="/auth/logout" className="font-medium text-blue-700 hover:text-blue-900">
            Sign out
          </a>
        </div>
      </section>
    </main>
  );
}
