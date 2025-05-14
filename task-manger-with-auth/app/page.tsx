// "use client";
// import { trpc } from "@/server/client";
// import AuthButton from "./_components/AuthButton";
// import { useSession } from "next-auth/react";

// export default function Home() {
//   const getData = trpc.getData.useQuery();
//   const { data: session } = useSession();

//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main>
//         <h1>Welcome to My App</h1>
//         <AuthButton />

//         {session ? (
//           <div>
//             <p>You are signed in as {session.user?.name}</p>
//             {/* Protected Content */}
//             {getData.data}
//           </div>
//         ) : (
//           <p>Please sign in to continue</p>
//         )}
//       </main>
//       {/* <h1>{getData.data}</h1> */}
//     </div>
//   );
// }

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Task Manager App</h1>
      <p className="text-xl mb-8">Manage your tasks with authentication</p>
      <div className="flex gap-4">
        <Link
          href="/auth/signIn"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
