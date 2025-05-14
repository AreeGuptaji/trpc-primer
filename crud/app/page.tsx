"use client";

import { trpc } from "@/server/client";
import { useState } from "react";

export default function Home() {
  const getUsers = trpc.userRouter.getUsers.useQuery();
  const addUser = trpc.userRouter.addUser.useMutation({
    onSuccess: () => {
      getUsers.refetch();
    },
  });
  const deleteUser = trpc.userRouter.deleteUser.useMutation({
    onSuccess: () => {
      getUsers.refetch();
    },
  });

  const [name, setName] = useState<string>("");
  const [race, setRace] = useState<string>("");
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex-col">
        {getUsers.data?.map((user) => (
          <div key={user.id} className="flex justify-between my-5">
            <div className="font-bold text-3xl">
              {user.name} - {user.race}
            </div>
            <button
              className="border rounded-md p-2"
              onClick={() => deleteUser.mutate({ id: user.id })}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div>
        Name:{" "}
        <input
          type="text"
          className="border-2 border-gray-300 rounded-md"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        Race:{" "}
        <input
          type="text"
          className="border-2 border-gray-300 rounded-md"
          onChange={(e) => setRace(e.target.value)}
          value={race}
        />
        <button onClick={() => addUser.mutate({ name, race })}>Add User</button>
      </div>
    </div>
  );
}
