import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/auth";
import ChatRoom from "@/app/_components/ChatRoom";
import Link from "next/link";
import { useParams } from "next/navigation";
export default async function ChatRoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch chat room details
  const roomId = params.roomId;
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    redirect("/chat");
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <Link href="/chat" className="text-blue-500 hover:underline">
          ← Back to Chat Rooms
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">{room.name}</h1>
      {room.description && (
        <p className="text-gray-600 mb-6">{room.description}</p>
      )}

      <ChatRoom roomId={roomId} />
    </div>
  );
}
