import { z } from "zod";
import { publicProcedure, router } from "./trpc";

import { PrismaClient } from "@/generated/prisma";
import { taskRouter } from "./routers/taskRouter";
const prisma = new PrismaClient();
export const appRouter = router({
  getData: publicProcedure.query(() => {
    return "Hello World";
  }),

  addUser: publicProcedure
    .input(z.object({ name: z.string(), email: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
        },
      });
    }),
  task: taskRouter,
});

export type AppRouter = typeof appRouter;
