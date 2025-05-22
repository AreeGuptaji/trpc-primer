import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/auth";

export const productRouter = router({
  getAll: publicProcedure.query(async () => {
    return prisma.product.findMany({
      include: { category: true },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const product = await prisma.product.findUnique({
        where: { id: input.id },
        include: { category: true },
      });
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }
      return product;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        price: z.number(),
        stock: z.number().positive(),
        image: z.string().optional(),
        categoryId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.session?.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can create products",
        });
      }
      return prisma.product.create({
        data: input,
      });
    }),

  // Update a product(admin only)

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().min(1).optional(),
        price: z.number().positive().optional(),
        stock: z.number().positive().optional(),
        image: z.string().optional(),
        categoryId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.session?.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update products",
        });
      }
      return prisma.product.update({
        where: { id: input.id },
        data: input,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.session?.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete products",
        });
      }
      const { id } = input;
      return await prisma.product.delete({
        where: { id: id },
      });
    }),
});
