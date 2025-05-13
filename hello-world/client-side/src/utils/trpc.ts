import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server-side/router";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

export const queryClient = new QueryClient();

export const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "http://localhost:3001/api" })],
});

export const trpc = createTRPCOptionsProxy({
  client: trpcClient,
  queryClient,
});
