// server/auth/index.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@/generated/prisma";
import Google from "next-auth/providers/google";

export const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    async session({ session, user }) {
      // Get the user from the database to include the role
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: dbUser?.role || "USER", // Include the role
        },
      };
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});
