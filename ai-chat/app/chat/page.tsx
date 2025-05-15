import ChatRoomList from "../_components/ChatRoomList";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Chat Rooms</h1>
      <ChatRoomList />
    </div>
  );
}
