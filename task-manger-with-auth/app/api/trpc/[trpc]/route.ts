import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "@/server/context";
import { appRouter } from "@/server";
import { NextRequest } from "next/server";

const handler = (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext,
  });
};

export { handler as GET, handler as POST };
