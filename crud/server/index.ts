import { router } from "./trpc";
import { userRouter } from "./routers/user";

export const appRouter = router({
  userRouter,
});

export type AppRouter = typeof appRouter;
