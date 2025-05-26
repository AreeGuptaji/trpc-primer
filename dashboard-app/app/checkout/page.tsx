"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart, isLoading } = trpc.cart.getCart.useQuery();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const createOrderMutation = trpc.order.createFromCart.useMutation({
    onSuccess: (data) => {
      setIsPlacingOrder(false);
      // Redirect to order confirmation page
      router.push(`/orders/${data.id}`);
    },
    onError: (error) => {
      setIsPlacingOrder(false);
      alert(`Error: ${error.message}`);
    },
  });

  const calculateTotal = () => {
    if (!cart?.cartItems) return 0;
    return cart.cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);
    createOrderMutation.mutate();
  };

  if (isLoading)
    return <div className="p-8">Loading checkout information...</div>;

  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="mb-6 text-gray-600">
          Add some products before checking out
        </p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="divide-y">
            {cart.cartItems.map((item) => (
              <div key={item.id} className="py-4 flex items-center gap-4">
                {item.product.image && (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-gray-600 text-sm">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-sm">
                    ${item.product.price.toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white p-6 rounded-lg shadow h-fit">
          <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isPlacingOrder ? "Processing..." : "Place Order"}
          </button>

          <Link
            href="/cart"
            className="w-full block text-center mt-4 text-blue-600 hover:underline"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
