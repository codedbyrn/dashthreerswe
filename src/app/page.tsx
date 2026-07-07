"use client";

import Link from "next/link";
import { useAuth } from "@/auth/hooks/useAuth";
import { signOut } from "@/auth/services/authService";
import { Icon } from "@/components/Icons";

export default function Home() {
  const { user, role, loading } = useAuth();

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between font-sans text-brand-dark p-6 md:p-12 relative overflow-hidden">
      {/* Decorative notebook lines and elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(#320809_1px,transparent_1px)] bg-[size:100%_24px]"></div>

      {/* Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between relative z-10">
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
          reem<span className="text-brand-main2">.N</span>
        </Link>

        <div>
          {loading ? (
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider animate-pulse">
              Authenticating...
            </span>
          ) : user ? (
            <div className="flex items-center gap-4">
              {role === "superuser" && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-xs font-semibold bg-brand-dark hover:bg-brand-dark/90 text-brand-bg rounded-default transition-all duration-180"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="text-xs font-semibold text-brand-main2 hover:underline cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/signin"
              className="px-5 py-2 text-xs font-semibold bg-brand-main2 hover:bg-brand-main2/95 text-white rounded-default shadow-sm transition-all duration-180"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Focus Area */}
      <main className="max-w-3xl w-full mx-auto my-auto py-16 relative z-10 text-center sm:text-left space-y-6">
        <span className="text-xs font-bold tracking-widest text-brand-main2 uppercase">
          Personal Knowledge Curation
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold leading-tight tracking-tight text-brand-dark">
          Editorial Curation &amp; System Admin
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 font-serif leading-relaxed max-w-2xl">
          Welcome to the Editorial Intelligence design system, designed for premium Stationery, Knowledge Management, and shop administration.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center sm:justify-start">
          {user ? (
            <Link
              className="flex h-12 items-center justify-center gap-2 rounded-default bg-brand-main2 hover:bg-brand-main2/95 px-6 text-white font-semibold shadow-md transition-all duration-180"
              href="/dashboard"
            >
              <Icon name="dashboard" size={18} />
              Go to Dashboard
            </Link>
          ) : (
            <Link
              className="flex h-12 items-center justify-center gap-2 rounded-default bg-brand-main2 hover:bg-brand-main2/95 px-6 text-white font-semibold shadow-md transition-all duration-180"
              href="/signin"
            >
              <Icon name="logout" size={18} className="rotate-180" />
              Get Started
            </Link>
          )}

          <a
            className="flex h-12 items-center justify-center gap-2 rounded-default border border-[#e4d7d0] bg-white/70 hover:bg-white px-6 text-gray-700 hover:text-brand-dark transition-all duration-180 font-semibold"
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto border-t border-[#e4d7d0] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400 relative z-10 font-sans">
        <p>© 2026 reem.N. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:text-brand-dark cursor-pointer">Privacy Policy</span>
          <span className="hover:text-brand-dark cursor-pointer">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}
