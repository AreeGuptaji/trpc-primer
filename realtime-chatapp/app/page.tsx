import { AuthButton } from "./_components/AuthButton";
import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-8">tRPC Chat App</h1>

      <div className="flex justify-center mb-8">
        <AuthButton />
      </div>

      {session && (
        <Link
          href="/chat"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-medium text-lg hover:bg-blue-600"
        >
          Go to Chat Rooms
        </Link>
      )}
    </div>
  );
}
