import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { PrismaClient } from "@/generated/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  pages: {
    signIn: "/auth/signin",
  },
});
