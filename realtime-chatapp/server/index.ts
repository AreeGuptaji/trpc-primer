import { publicProcedure, router } from "./trpc";
import { chatRouter } from "./router/chatRouter";

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return "Hello Universe!";
  }),
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
