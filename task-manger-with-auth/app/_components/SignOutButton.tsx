"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-4 py-2 rounded"
    >
      Sign Out
    </button>
  );
}
