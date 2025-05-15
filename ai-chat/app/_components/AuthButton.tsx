"use client";
import { signInWithGoogle } from "../_actions/signInWithGoogle";
import { signIn, signOut, useSession } from "next-auth/react";

export const AuthButton = () => {
  const { data: session } = useSession();

  if (session) {
    return <button onClick={() => signOut()}>Sign out</button>;
  }

  return <button onClick={() => signInWithGoogle()}>Sign in</button>;
};
