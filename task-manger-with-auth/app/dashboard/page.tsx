import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TaskList from "../_components/TaskList";
import SignOutButton from "../_components/SignOutButton";

export default async function Dashboard() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-5">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-6">
            Welcome,{session.user?.name}
          </h1>
          <SignOutButton />
        </div>
        <TaskList />
      </div>
    </>
  );
}
