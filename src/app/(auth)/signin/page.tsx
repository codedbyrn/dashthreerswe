"use client";

import React, { useState } from "react";
import { signIn } from "../../../auth/services/authService";
import Alert from "../../../auth/components/Alert";
import Spinner from "../../../auth/components/Spinner";
import Link from "next/link";

export default function SignInPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg p-4 font-sans text-brand-dark">
      {/* Decorative lined notebook pattern background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(#320809_1px,transparent_1px)] bg-[size:100%_24px]"></div>

      <div className="w-full max-w-md bg-white rounded-default shadow-xl p-8 border border-[#e4d7d0]/60 relative z-10">
        {/* Editorial Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="font-serif text-3xl font-bold tracking-tight">
            reem<span className="text-brand-main2">.N</span>
          </Link>
          <h2 className="text-lg font-serif text-gray-500 mt-2 font-medium">Sign In to Dashboard</h2>
        </div>

        {/* Error Alert feedback if present */}
        <Alert message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-dark/70">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              className="mt-1.5 block w-full border border-[#e4d7d0] rounded-default p-2.5 focus:border-brand-main2 focus:ring-1 focus:ring-brand-main2 focus:outline-none bg-brand-bg/10"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-dark/70">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="mt-1.5 block w-full border border-[#e4d7d0] rounded-default p-2.5 focus:border-brand-main2 focus:ring-1 focus:ring-brand-main2 focus:outline-none bg-brand-bg/10"
              placeholder="•••••••••"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 rounded border-[#e4d7d0] text-brand-main2 focus:ring-brand-main2 accent-brand-main2"
              />
              <label htmlFor="remember_me" className="text-xs text-brand-dark/80 font-medium select-none">
                Remember my session
              </label>
            </div>
          </div>

          {/* Action Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-default text-sm font-semibold text-white bg-brand-main2 hover:bg-brand-main2/95 shadow-sm hover:shadow transition-colors focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Spinner /> : "Access System"}
          </button>
        </form>

        {/* Recover link */}
        <div className="mt-6 text-center text-xs text-gray-500 border-t border-gray-100 pt-4">
          <p>
            Forgot your password?{" "}
            <Link href="/forgot-password" className="text-brand-main2 font-semibold hover:underline">
              Recover access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
