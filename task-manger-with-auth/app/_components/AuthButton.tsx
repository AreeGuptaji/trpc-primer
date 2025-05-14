"use client";
import { signOut } from "@/auth";
import { useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  const loading = status === "loading";
  if (loading) return <button disabled>Loading....</button>;

  if (session) {
    return <button onClick={() => signOut()}>Sign Out</button>;
  }

  return (
    <>
      <button
        onClick={() => (window.location.href = "/auth/signIn")}
        type="submit"
      >
        Sign in
      </button>
    </>
  );
}
