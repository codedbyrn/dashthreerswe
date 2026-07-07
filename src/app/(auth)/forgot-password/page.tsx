"use client";

import React, { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "../../../auth/services/authService";
import Alert from "../../../auth/components/Alert";
import Spinner from "../../../auth/components/Spinner";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordReset(formData);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.success);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg p-4 font-sans text-brand-dark">
      {/* Decorative lined notebook pattern background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(#320809_1px,transparent_1px)] bg-[size:100%_24px]"></div>

      <div className="w-full max-w-md bg-white rounded-default shadow-xl p-8 border border-[#e4d7d0]/60 relative z-10">
        <div className="text-center mb-6">
          <Link href="/" className="font-serif text-3xl font-bold tracking-tight">
            reem<span className="text-brand-main2">.N</span>
          </Link>
          <h2 className="text-lg font-serif text-gray-500 mt-2 font-medium">Recover Access</h2>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Enter your registered email below, and we will send you a secure link to reset your credentials.
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
              Registered Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              className="mt-1.5 block w-full border border-[#e4d7d0] rounded-default p-2.5 focus:border-brand-main2 focus:ring-1 focus:ring-brand-main2 focus:outline-none bg-brand-bg/10"
              placeholder="name@company.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-default text-sm font-semibold text-white bg-brand-main2 hover:bg-brand-main2/95 shadow-sm hover:shadow transition-colors focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Spinner /> : "Send Recovery Link"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500 border-t border-gray-100 pt-4">
          <p>
            Remembered your credentials?{" "}
            <Link href="/signin" className="text-brand-main2 font-semibold hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
