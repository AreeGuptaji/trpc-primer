import { router, publicProcedure } from "./trpc";

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return "Hello, world!";
  }),
});

export type AppRouter = typeof appRouter;
