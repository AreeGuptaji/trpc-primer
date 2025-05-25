import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export const orderRouter = router({
  // Create order from cart
  createFromCart: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get user's cart with items
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.cartItems.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cart is empty",
      });
    }

    // Calculate total
    const total = cart.cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Check stock availability for all items
    for (const item of cart.cartItems) {
      if (item.product.stock < item.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Not enough stock for ${item.product.name}`,
        });
      }
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          status: "PENDING",
        },
      });

      // Create order items
      for (const item of cart.cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price, // Store price at time of purchase
          },
        });

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return order;
  }),

  // Get user's orders
  getUserOrders: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  // Get all orders (admin only)
  getAllOrders: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (ctx.session.user.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view all orders",
      });
    }

    return prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  // Get order by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Users can only see their own orders, admins can see all
      if (
        order.userId !== ctx.session.user.id &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own orders",
        });
      }

      return order;
    }),

  // Update order status (admin only)
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "PENDING",
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
          "CANCELLED",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update order status",
        });
      }

      const order = await prisma.order.findUnique({
        where: { id: input.id },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return prisma.order.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  // Cancel order (user can cancel pending orders)
  cancelOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.id },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Users can only cancel their own orders
      if (order.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only cancel your own orders",
        });
      }

      // Can only cancel pending orders
      if (order.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only cancel pending orders",
        });
      }

      // Restore stock and update order status
      await prisma.$transaction(async (tx) => {
        // Restore stock for all items
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        // Update order status
        await tx.order.update({
          where: { id: input.id },
          data: { status: "CANCELLED" },
        });
      });

      return { success: true };
    }),

  // Get order statistics (admin only)
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (ctx.session.user.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view order statistics",
      });
    }

    const [totalOrders, totalRevenue, pendingOrders, completedOrders] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: {
            total: true,
          },
          where: {
            status: {
              not: "CANCELLED",
            },
          },
        }),
        prisma.order.count({
          where: {
            status: "PENDING",
          },
        }),
        prisma.order.count({
          where: {
            status: "DELIVERED",
          },
        }),
      ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      completedOrders,
    };
  }),
});
