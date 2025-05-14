import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const taskRouter = router({
  getTasks: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.task.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  createTask: protectedProcedure
    .input(
      z.object({ title: z.string().min(1), description: z.string().optional() })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.task.create({
        data: {
          title: input.title,
          description: input.description,
          userId: ctx.session.user.id,
        },
      });
    }),

  deleteTask: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
      });

      if (!task || task.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.prisma.task.delete({
        where: { id: input.id },
      });
    }),

  toggleTask: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
      });

      if (!task || task.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.prisma.task.update({
        where: { id: input.id },
        data: { completed: !task.completed },
      });
    }),
});
