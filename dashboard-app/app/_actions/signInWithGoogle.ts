"use server";
import { signIn } from "@/server/auth";

export async function signInWithGoogle() {
  return signIn("google");
}
