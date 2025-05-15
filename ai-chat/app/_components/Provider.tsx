"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/server/client";
import { httpBatchLink, splitLink, createWSClient, wsLink } from "@trpc/client";
import { useState } from "react";

export default function Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => {
    const wsClient = createWSClient({
      url: `ws://localhost:3000/api/trpc`,
    });

    return trpc.createClient({
      links: [
        splitLink({
          condition(op) {
            // Use WebSocket for subscriptions
            return op.type === "subscription";
          },
          true: wsLink({
            client: wsClient,
          }),
          false: httpBatchLink({
            url: "/api/trpc",
          }),
        }),
      ],
    });
  });

  return (
    <>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </>
  );
}
