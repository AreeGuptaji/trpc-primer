"use client";

import { trpc } from "@/trpc/client";
import Link from "next/link";

export default function CartPage() {
  const { data: cart, isLoading, refetch } = trpc.cart.getCart.useQuery();
  const removeItemMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const updateQuantityMutation = trpc.cart.updateItemQuantity.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const clearCartMutation = trpc.cart.clearCart.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const calculateTotal = () => {
    if (!cart?.cartItems) return 0;
    return cart.cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  if (isLoading) return <div>Loading cart...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {cart?.cartItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cart?.cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border rounded-lg mb-4"
              >
                {item.product.image && (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-gray-600">
                    ${item.product.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantityMutation.mutate({
                        cartItemId: item.id,
                        quantity: Math.max(1, item.quantity - 1),
                      })
                    }
                    className="w-8 h-8 flex items-center justify-center border rounded"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantityMutation.mutate({
                        cartItemId: item.id,
                        quantity: item.quantity + 1,
                      })
                    }
                    className="w-8 h-8 flex items-center justify-center border rounded"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() =>
                    removeItemMutation.mutate({ cartItemId: item.id })
                  }
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-gray-50 p-6 rounded-lg h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/cart/checkout"
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 mb-2 text-center block"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={() => clearCartMutation.mutate()}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
