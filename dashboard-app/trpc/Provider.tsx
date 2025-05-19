"use client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/api/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { trpc } from "./client";

export const Provider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => {
    return trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
        }),
      ],
    });
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
