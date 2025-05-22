"use client";

import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-xl font-bold text-blue-600">ShopEase</div>
          {session ? (
            <div className="space-x-4">
              <button
                className="text-blue-600 hover:text-blue-800"
                onClick={() => signOut()}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <a
                href="/auth/login"
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                Login
              </a>
              <a
                href="/auth/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Register
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-6xl mx-auto px-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to ShopEase</h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover amazing products at unbeatable prices.
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Shop Now
          </button>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Electronics", "Clothing", "Home & Kitchen"].map((category) => (
            <div
              key={category}
              className="border rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{category}</h3>
              <p className="text-gray-600 mb-4">
                Explore our {category.toLowerCase()} collection
              </p>
              <a href="#" className="text-blue-600 hover:underline">
                View Products
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="font-semibold">Product {item}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Product description goes here
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">
                      ${(19.99 * item).toFixed(2)}
                    </span>
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ShopEase</h3>
              <p className="text-gray-300">
                Your one-stop shop for all your needs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  Facebook
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  Twitter
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  Instagram
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-300">
            <p>
              &copy; {new Date().getFullYear()} ShopEase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
