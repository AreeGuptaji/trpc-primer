import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export const cartRouter = router({
  // Get user's cart with all items
  getCart: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Find or create cart
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          cartItems: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }),

  // Add item to cart
  addItem: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Find or create cart
      let cart = await prisma.cart.findFirst({
        where: { userId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
        });
      }

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check if product is in stock
      if (product.stock < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough stock available",
        });
      }

      // Check if item already exists in cart
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: input.productId,
          },
        },
      });

      if (existingItem) {
        // Update quantity (check stock again)
        const newQuantity = existingItem.quantity + input.quantity;
        if (product.stock < newQuantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Not enough stock available",
          });
        }

        return prisma.cartItem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            quantity: newQuantity,
          },
          include: {
            product: true,
          },
        });
      }

      // Create new cart item
      return prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: input.productId,
          quantity: input.quantity,
        },
        include: {
          product: true,
        },
      });
    }),

  // Remove item from cart
  removeItem: protectedProcedure
    .input(z.object({ cartItemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Find cart
      const cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          cartItems: true,
        },
      });

      if (!cart) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart not found",
        });
      }

      // Check if item exists in cart
      const cartItem = cart.cartItems.find(
        (item) => item.id === input.cartItemId
      );

      if (!cartItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Item not found in cart",
        });
      }

      // Delete cart item
      return prisma.cartItem.delete({
        where: {
          id: input.cartItemId,
        },
      });
    }),

  // Update item quantity
  updateItemQuantity: protectedProcedure
    .input(
      z.object({
        cartItemId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Find cart
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

      if (!cart) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart not found",
        });
      }

      // Check if item exists in cart
      const cartItem = cart.cartItems.find(
        (item) => item.id === input.cartItemId
      );

      if (!cartItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Item not found in cart",
        });
      }

      // Check if product has enough stock
      if (cartItem.product.stock < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough stock available",
        });
      }

      // Update cart item
      return prisma.cartItem.update({
        where: {
          id: input.cartItemId,
        },
        data: {
          quantity: input.quantity,
        },
        include: {
          product: true,
        },
      });
    }),

  // Clear cart
  clearCart: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Find cart
    const cart = await prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      return { success: true };
    }

    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return { success: true };
  }),

  // Get cart count (for navbar)
  getCartCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        cartItems: true,
      },
    });

    if (!cart) {
      return 0;
    }

    return cart.cartItems.reduce((total, item) => total + item.quantity, 0);
  }),
});
