import { trpc } from "./utils/trpc";
import { useQuery } from "@tanstack/react-query";
export const Greeting = () => {
  const hello = useQuery(trpc.hello.queryOptions());
  const greeting = useQuery(trpc.greeting.queryOptions({ name: "Aman" }));

  return (
    <>
      <div>{hello.data}</div>
      <div className="mt-10 font-bold text-2xl mx-10 text-center">
        {greeting.data}
      </div>
    </>
  );
};
