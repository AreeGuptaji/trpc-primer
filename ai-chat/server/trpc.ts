import { initTRPC, TRPCError } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { PrismaClient } from "@/generated/prisma";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export const createContext = async (
  opts: CreateNextContextOptions | CreateWSSContextFnOptions
) => {
  // For HTTP (API) requests
  if ("req" in opts) {
    const session = await auth();
    return {
      prisma,
      session,
    };
  }

  // For WebSocket requests
  // You might need a more sophisticated token-based auth for WebSockets
  return {
    prisma,
  };
};

const t = initTRPC.context<typeof createContext>().create();
export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
