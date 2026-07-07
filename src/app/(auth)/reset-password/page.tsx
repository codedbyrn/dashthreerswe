"use client";

import React, { useState, useEffect, Suspense } from "react";
import PasswordStrength from "../../../auth/components/PasswordStrength";
import { updatePassword } from "../../../auth/services/authService";
import Alert from "../../../auth/components/Alert";
import Spinner from "../../../auth/components/Spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../auth/utils/supabase/client";
import Link from "next/link";

type PageState = "loading" | "invalid_link" | "ready";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>("loading");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlError = searchParams.get("error");
    const urlErrorCode = searchParams.get("error_code");
    const code = searchParams.get("code");

    if (urlError || urlErrorCode) {
      setPageState("invalid_link");
      return;
    }

    if (code) {
      const supabase = createClient();
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setPageState("invalid_link");
        } else {
          setPageState("ready");
        }
      });
      return;
    }

    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setPageState("ready");
      } else {
        setPageState("invalid_link");
      }
    });
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.success);
      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    }
    setLoading(false);
  };

  // ── Loading state ──────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-bg p-4 font-sans text-brand-dark">
        <div className="flex flex-col items-center gap-4 text-brand-main2 relative z-10">
          <Spinner />
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider animate-pulse">
            Verifying recovery link...
          </p>
        </div>
      </div>
    );
  }

  // ── Expired / Invalid link ─────────────────────────────────────
  if (pageState === "invalid_link") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-bg p-4 font-sans text-brand-dark">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(#320809_1px,transparent_1px)] bg-[size:100%_24px]"></div>

        <div className="w-full max-w-md bg-white rounded-default shadow-xl p-8 border border-[#e4d7d0]/60 text-center relative z-10 space-y-6">
          <div className="flex justify-center">
            <span className="text-5xl">⏰</span>
          </div>

          <h2 className="font-serif text-2xl font-bold text-brand-dark">
            Expired or Invalid Link
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
            The password reset token is invalid, has expired, or was already used. Please request a new recovery link.
          </p>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => router.push("/forgot-password")}
              className="w-full py-2.5 px-4 rounded-default font-semibold text-white bg-brand-main2 hover:bg-brand-main2/95 transition-colors shadow-sm cursor-pointer text-sm"
            >
              Request New Link
            </button>

            <button
              onClick={() => router.push("/signin")}
              className="w-full py-2.5 px-4 rounded-default font-semibold text-gray-600 border border-[#e4d7d0] hover:bg-gray-50 hover:text-brand-dark transition-colors text-sm cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Ready: show the reset form ─────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg p-4 font-sans text-brand-dark">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(#320809_1px,transparent_1px)] bg-[size:100%_24px]"></div>

      <div className="w-full max-w-md bg-white rounded-default shadow-xl p-8 border border-[#e4d7d0]/60 relative z-10">
        <div className="text-center mb-6">
          <Link href="/" className="font-serif text-3xl font-bold tracking-tight">
            reem<span className="text-brand-main2">.N</span>
          </Link>
          <h2 className="text-lg font-serif text-gray-500 mt-2 font-medium">New Credentials</h2>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Please enter your new security password below to complete the account recovery.
          </p>
        </div>

        <Alert message={error} />
        {success && (
          <div className="p-3 mb-4 text-xs text-green-700 bg-green-50 rounded-default border border-green-200 text-left">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-dark/70">
              New Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1.5 block w-full border border-[#e4d7d0] rounded-default p-2.5 focus:border-brand-main2 focus:ring-1 focus:ring-brand-main2 focus:outline-none bg-brand-bg/10"
              placeholder="•••••••••"
            />
            <div className="mt-2 text-left">
              <PasswordStrength password={password} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-dark/70">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1.5 block w-full border border-[#e4d7d0] rounded-default p-2.5 focus:border-brand-main2 focus:ring-1 focus:ring-brand-main2 focus:outline-none bg-brand-bg/10"
              placeholder="•••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-default text-sm font-semibold text-white bg-brand-main2 hover:bg-brand-main2/95 shadow-sm hover:shadow transition-colors focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Spinner /> : "Update Password & Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-brand-bg p-4 font-sans text-brand-dark">
        <div className="flex flex-col items-center gap-4 text-brand-main2 relative z-10">
          <Spinner />
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider animate-pulse">
            Verifying recovery link...
          </p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
