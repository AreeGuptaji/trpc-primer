import { auth, prisma } from "@/auth";

export async function createContext() {
  const session = await auth();
  return {
    session,
    prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
