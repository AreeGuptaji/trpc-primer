"use client";
import { useState } from "react";
import Image from "next/image";

type MessageProps = {
  message: {
    id: string;
    content: string;
    createdAt: Date;
    user: {
      name?: string | null;
      image?: string | null;
    };
  };
  isOwnMessage: boolean;
};

export default function ChatMessage({ message, isOwnMessage }: MessageProps) {
  return (
    <div
      className={`flex mb-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[70%] ${
          isOwnMessage ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
          <div className="bg-gray-300 h-full w-full flex items-center justify-center">
            {message.user.name?.charAt(0) || "U"}
          </div>
        </div>

        <div
          className={`px-4 py-2 rounded-lg mx-2 ${
            isOwnMessage
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          <p>{message.content}</p>
          <p className="text-xs opacity-70 mt-1">
            {new Date(message.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
