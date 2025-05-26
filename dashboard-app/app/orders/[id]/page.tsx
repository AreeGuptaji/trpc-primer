"use client";

import { trpc } from "@/trpc/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

// Helper function to format date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper to get status badge
const OrderStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`${getStatusColor()} text-xs font-medium px-2.5 py-0.5 rounded-full`}
    >
      {status}
    </span>
  );
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [isCancelling, setIsCancelling] = useState(false);

  const {
    data: order,
    isLoading,
    refetch,
  } = trpc.order.getById.useQuery({
    id: orderId,
  });

  const cancelOrderMutation = trpc.order.cancelOrder.useMutation({
    onSuccess: () => {
      setIsCancelling(false);
      refetch();
    },
    onError: (error) => {
      setIsCancelling(false);
      alert(`Error: ${error.message}`);
    },
  });

  const handleCancelOrder = () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      setIsCancelling(true);
      cancelOrderMutation.mutate({ id: orderId });
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-6">
          The order you're looking for doesn't exist or you don't have
          permission to view it.
        </p>
        <Link
          href="/orders"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Order Details</h1>
        <Link
          href="/orders"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="font-medium">Order #{order.id.slice(-6)}</h2>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm text-gray-600">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            {order.status === "PENDING" && (
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="mt-4 sm:mt-0 text-red-600 hover:text-red-800 font-medium disabled:text-red-400"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
          </div>
        </div>

        <div className="p-6 border-b">
          <h3 className="font-medium mb-4">Order Items</h3>
          <div className="divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex items-center gap-4">
                {item.product.image && (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-sm">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal:</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Shipping:</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Tax:</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total:</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium mb-4">Order Status</h3>
        <div className="relative">
          <div className="flex items-center mb-8">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                order.status !== "CANCELLED"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300"
              }`}
            >
              1
            </div>
            <div className="ml-4">
              <h4 className="font-medium">Order Placed</h4>
              <p className="text-sm text-gray-600">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {order.status !== "CANCELLED" && (
            <>
              <div className="flex items-center mb-8">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ["PROCESSING", "SHIPPED", "DELIVERED"].includes(
                      order.status
                    )
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  2
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Processing</h4>
                  <p className="text-sm text-gray-600">
                    {["PROCESSING", "SHIPPED", "DELIVERED"].includes(
                      order.status
                    )
                      ? "Your order is being processed"
                      : "Waiting to be processed"}
                  </p>
                </div>
              </div>

              <div className="flex items-center mb-8">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ["SHIPPED", "DELIVERED"].includes(order.status)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  3
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Shipped</h4>
                  <p className="text-sm text-gray-600">
                    {["SHIPPED", "DELIVERED"].includes(order.status)
                      ? "Your order has been shipped"
                      : "Waiting to be shipped"}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === "DELIVERED"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  4
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Delivered</h4>
                  <p className="text-sm text-gray-600">
                    {order.status === "DELIVERED"
                      ? "Your order has been delivered"
                      : "Waiting to be delivered"}
                  </p>
                </div>
              </div>
            </>
          )}

          {order.status === "CANCELLED" && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-600 text-white">
                X
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Cancelled</h4>
                <p className="text-sm text-gray-600">
                  Your order has been cancelled
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
