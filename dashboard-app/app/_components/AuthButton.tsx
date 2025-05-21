"use client";

import { signOut } from "@/server/auth";
import { auth } from "@/server/auth";

export default async function AuthButton() {
  
  return (
    <div>
      {" "}
      {session ? (
        <div className="space-x-4">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => signOut()}
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="space-x-4">
          <a
            href="/auth/login"
            className="px-4 py-2 text-blue-600 hover:text-blue-800"
          >
            Login
          </a>
          <a
            href="/auth/register"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Register
          </a>
        </div>
      )}
    </div>
  );
}
