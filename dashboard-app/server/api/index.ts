import { router, publicProcedure } from "./trpc";
import { categoryRouter } from "./routers/category";
import { productRouter } from "./routers/product";

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return "Hello, world!";
  }),
  category: categoryRouter,
  product: productRouter,
});

export type AppRouter = typeof appRouter;
