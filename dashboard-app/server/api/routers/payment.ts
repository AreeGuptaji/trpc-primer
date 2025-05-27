import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { PrismaClient } from "@/generated/prisma";
import { stripe } from "@/stripe";

const prisma = new PrismaClient();

export const paymentRouter = router({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get the order
      const order = await prisma.order.findUnique({
        where: { id: input.orderId },
        include: {
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

      // Verify the order belongs to the user
      if (order.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to pay for this order",
        });
      }

      // Create line items for Stripe
      const lineItems = order.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
            description: item.product.description,
            images: item.product.image ? [item.product.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      }));
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: {
          orderId: order.id,
          userId: userId,
        },
      });

      // Update the order with the Stripe session ID
      await prisma.order.update({
        where: { id: order.id },
        data: {
          stripePaymentIntentId: session.payment_intent as string,
        },
      });

      return { sessionId: session.id, url: session.url };
    }),
});
