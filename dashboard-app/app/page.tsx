"use client";
import { trpc } from "@/trpc/client";

export default function Home() {
  const { data } = trpc.hello.useQuery();
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div>{data}</div>
    </div>
  );
}
