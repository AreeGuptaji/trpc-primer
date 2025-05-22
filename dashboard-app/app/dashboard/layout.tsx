// app/dashboard/layout.tsx
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not logged in
  if (!session) {
    redirect("/auth/login");
  }

  // Redirect if not admin (for admin-only pages)
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <div className="text-xl font-bold mb-8">Admin Dashboard</div>
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block py-2 px-4 rounded hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/products"
            className="block py-2 px-4 rounded hover:bg-gray-700"
          >
            Products
          </Link>
          <Link
            href="/dashboard/categories"
            className="block py-2 px-4 rounded hover:bg-gray-700"
          >
            Categories
          </Link>
          <Link
            href="/dashboard/orders"
            className="block py-2 px-4 rounded hover:bg-gray-700"
          >
            Orders
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-8">{children}</div>
    </div>
  );
}
