import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/auth/index";

export const categoryRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.category.findMany();
  }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const category = await prisma.category.findUnique({
        where: { id: input.id },
      });
      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category;
    }),

  create: protectedProcedure
    .input(
      z.object({ name: z.string().min(1), description: z.string().min(1) })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.session?.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create categories",
        });
      }

      return await prisma.category.create({
        data: input,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.session?.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update categories",
        });
      }
      const { id, ...data } = input;
      return await prisma.category.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.session?.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete categories",
        });
      }

      const { id } = input;
      return await prisma.category.delete({
        where: { id: id },
      });
    }),
});
