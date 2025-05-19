import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/api";

const handler = (req: Request) => {
  return fetchRequestHandler({
    router: appRouter,
    req,
    endpoint: "/api/trpc",
    createContext: () => ({}),
  });
};

export { handler as GET, handler as POST };
