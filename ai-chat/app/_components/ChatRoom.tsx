"use client";
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/server/client";
import { useSession } from "next-auth/react";
import ChatMessage from "./ChatMessage";

export default function ChatRoom({ roomId }: { roomId: string }) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch existing messages
  const { data } = trpc.chat.getMessages.useQuery(
    { chatRoomId: roomId },
    {
      enabled: !!roomId,
    }
  );

  // Update all messages when data changes
  useEffect(() => {
    if (data) {
      setAllMessages(data);
    }
  }, [data]);

  // Subscribe to new messages
  trpc.chat.onMessage.useSubscription(
    { chatRoomId: roomId },
    {
      enabled: !!roomId,
      onData: (newMessage) => {
        // Add the new message to the state
        setAllMessages((prev) => {
          // Only add if not already in the array (prevent duplicates)
          if (!prev.find((m) => m.id === newMessage.id)) {
            return [...prev, newMessage];
          }
          return prev;
        });

        // Scroll to bottom when new message arrives
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      },
    }
  );

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    // Optimistic update - immediately show the message
    onMutate: (newMessage) => {
      // Create a temporary message object
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: newMessage.content,
        createdAt: new Date(),
        userId: session?.user?.id || "",
        chatRoomId: roomId,
        user: {
          name: session?.user?.name,
          image: session?.user?.image,
        },
      };

      // Add it to the UI immediately
      setAllMessages((prev) => [...prev, tempMessage]);

      // Scroll to bottom
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !session?.user) return;

    try {
      await sendMessageMutation.mutateAsync({
        content: message,
        chatRoomId: roomId,
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Scroll to bottom when component mounts
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] border rounded-lg">
      <div className="flex-1 p-4 overflow-y-auto">
        {allMessages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isOwnMessage={msg.userId === session?.user?.id}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t p-4 flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-l-lg border p-2"
        />
        <button
          type="submit"
          disabled={!message.trim() || sendMessageMutation.isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg disabled:bg-gray-300"
        >
          {sendMessageMutation.isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
