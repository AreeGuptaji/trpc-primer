import { publicProcedure, router } from "../trpc";

import { z } from "zod";

import { PrismaClient } from "@/app/generated/prisma";
const prisma = new PrismaClient();

export const userRouter = router({
  getUsers: publicProcedure.query(async () => {
    const users = await prisma.user.findMany();
    return users;
  }),
  addUser: publicProcedure
    .input(z.object({ name: z.string(), race: z.string() }))
    .mutation(async ({ input }) => {
      console.log(input);
      await prisma.user.create({
        data: {
          name: input.name,
          race: input.race,
        },
      });
    }),
  deleteUser: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await prisma.user.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
