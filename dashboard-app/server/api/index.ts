import { router, publicProcedure } from "./trpc";
import { categoryRouter } from "./routers/category";
import { productRouter } from "./routers/product";
import { cartRouter } from "./routers/cart";
import { orderRouter } from "./routers/order";

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return "Hello, world!";
  }),
  category: categoryRouter,
  product: productRouter,
  cart: cartRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;
