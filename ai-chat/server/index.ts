import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return "Hello Universe!";
  }),
  //   onMessage: publicProcedure.subscription(() => {
  //     return {
  //       async *generator() {
  //         yield { id: 1, message: "Connected to Websocket" };
  //       },
  //     };
  //   }),
});

export type AppRouter = typeof appRouter;
