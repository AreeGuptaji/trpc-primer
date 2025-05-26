"use client";

import { trpc } from "@/trpc/client";
import Link from "next/link";

// Helper function to format date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
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

export default function OrdersPage() {
  const { data: orders, isLoading } = trpc.order.getUserOrders.useQuery();

  if (isLoading) {
    return <div className="p-8">Loading your orders...</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
        <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-8">Your Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-medium">Order #{order.id.slice(-6)}</h2>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-sm text-gray-600">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Link
                  href={`/orders/${order.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Only show first 3 items to save space */}
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    {item.product.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Show message if there are more items */}
                {order.items.length > 3 && (
                  <p className="text-sm text-gray-600 italic">
                    +{order.items.length - 3} more item
                    {order.items.length - 3 > 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    Total: ${order.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {order.items.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                    items
                  </p>
                </div>
                {order.status === "PENDING" && (
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
