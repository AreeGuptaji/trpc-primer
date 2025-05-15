"use client";
import { useState } from "react";
import { trpc } from "@/server/client";
import Link from "next/link";

export default function ChatRoomList() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");

  // Query chat rooms
  const { data: rooms = [], refetch } = trpc.chat.getChatRooms.useQuery();

  // Create chat room mutation
  const createRoomMutation = trpc.chat.createChatRoom.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreateForm(false);
      setNewRoomName("");
      setNewRoomDesc("");
    },
  });

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      await createRoomMutation.mutateAsync({
        name: newRoomName,
        description: newRoomDesc,
      });
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chat Rooms</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 text-white px-3 py-1 rounded-lg"
        >
          {showCreateForm ? "Cancel" : "Create Room"}
        </button>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreateRoom}
          className="mb-4 p-3 border rounded-lg"
        >
          <div className="mb-2">
            <label className="block text-sm mb-1">Room Name:</label>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1">Description:</label>
            <input
              type="text"
              value={newRoomDesc}
              onChange={(e) => setNewRoomDesc(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-3 py-1 rounded-lg"
            disabled={createRoomMutation.isLoading}
          >
            {createRoomMutation.isLoading ? "Creating..." : "Create Room"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {rooms.length === 0 ? (
          <p className="text-gray-500">No chat rooms available.</p>
        ) : (
          rooms.map((room) => (
            <Link
              href={`/chat/${room.id}`}
              key={room.id}
              className="block border p-3 rounded-lg hover:bg-gray-50"
            >
              <h3 className="font-medium">{room.name}</h3>
              {room.description && (
                <p className="text-sm text-gray-600">{room.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {room._count?.members || 0} members
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
