import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { router } from "../trpc";
import { publicProcedure, protectedProcedure } from "../trpc";

import { EventEmitter } from "events";

import { Message } from "@/generated/prisma";

// Create an event emitter for chat messages
const ee = new EventEmitter();

export const chatRouter = router({
  // Chat rooms
  createChatRoom: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const chatRoom = await ctx.prisma.chatRoom.create({
        data: {
          name: input.name,
          description: input.description,
          members: {
            create: {
              userId: ctx.session.user.id!,
            },
          },
        },
      });
      return chatRoom;
    }),

  getChatRooms: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.chatRoom.findMany({
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
  }),

  joinChatRoom: protectedProcedure
    .input(z.object({ chatRoomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.chatRoomMember.create({
        data: {
          userId: ctx.session.user.id!,
          chatRoomId: input.chatRoomId,
        },
      });
    }),

  // Messages
  sendMessage: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        chatRoomId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.message.create({
        data: {
          content: input.content,
          userId: ctx.session.user.id!,
          chatRoomId: input.chatRoomId,
        },
        include: {
          user: true,
        },
      });

      // Emit event with the new message
      ee.emit(`chat:${input.chatRoomId}`, message);

      return message;
    }),

  getMessages: protectedProcedure
    .input(z.object({ chatRoomId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.message.findMany({
        where: {
          chatRoomId: input.chatRoomId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    }),

  // Subscription for new messages in a chat room
  onMessage: protectedProcedure
    .input(z.object({ chatRoomId: z.string() }))
    .subscription(({ input }) => {
      return observable<
        Message & { user: { name?: string | null; image?: string | null } }
      >((emit) => {
        const onMessage = (
          message: Message & {
            user: { name?: string | null; image?: string | null };
          }
        ) => {
          emit.next(message);
        };

        // Subscribe to new messages in this chat room
        ee.on(`chat:${input.chatRoomId}`, onMessage);

        // Cleanup when unsubscribing
        return () => {
          ee.off(`chat:${input.chatRoomId}`, onMessage);
        };
      });
    }),
});
