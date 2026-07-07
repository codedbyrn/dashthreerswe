"use client";

import { signOut } from "../services/authService";

export function ButtonSignOut() {
  return (
    <button
      onClick={() => signOut()}
      className="mt-6 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
    >
      تسجيل الخروج وإنهاء الجلسة
    </button>
  );
}