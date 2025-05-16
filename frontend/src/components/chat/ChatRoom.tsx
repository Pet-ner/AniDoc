"use client";

import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useUser } from "@/contexts/UserContext";
import useWebSocket from "@/hooks/useWebSocket";

interface ChatRoomProps {
  reservationId: number;
}

export default function ChatRoom({ reservationId }: ChatRoomProps) {
  const { user } = useUser();
  const [roomId, setRoomId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채팅방 정보 가져오기
  useEffect(() => {
    if (!user || !reservationId) return;

    const createOrGetChatRoom = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/rooms`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reservationId,
              userId: user.id,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("채팅방 생성 실패");
        }

        const data = await response.json();
        setRoomId(data.id);
      } catch (error) {
        console.error("채팅방 생성 오류:", error);
      }
    };

    createOrGetChatRoom();
  }, [reservationId, user]);

  const { messages, connected, sendMessage } = useWebSocket({
    roomId,
    userId: user?.id || null,
  });

  // 스크롤 처리
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!roomId || !user) {
    return <div className="p-4 text-center">로딩 중...</div>;
  }

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden shadow-sm bg-white">
      <div className="bg-teal-50 p-3 border-b border-teal-100">
        <h2 className="font-semibold text-teal-700">1:1 상담</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === user.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={sendMessage} disabled={!connected} />
    </div>
  );
}
