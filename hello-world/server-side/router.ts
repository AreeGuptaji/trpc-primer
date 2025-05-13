import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return "Hello World ";
  }),
  greeting: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name}. Nice to meet you`;
    }),
});

export type AppRouter = typeof appRouter;
