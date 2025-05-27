"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingTriggerRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
            credentials: "include",
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

  const {
    messages,
    connected,
    loading,
    hasMoreMessages,
    sendMessage,
    loadMoreMessages,
  } = useWebSocket({
    roomId,
    userId: user?.id || null,
  });

  // 초기 메시지 로드하고 맨 아래로 스크롤
  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        setIsInitialLoad(false);
      });
    }
  }, [messages, isInitialLoad]);

  // 새 메시지가 추가될 때 자동 스크롤
  useEffect(() => {
    if (!isInitialLoad && isAutoScroll && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isAutoScroll, isInitialLoad]);

  // 무한스크롤 감지
  useEffect(() => {
    // 초기 로드 중이거나 더 불러올 메시지가 없으면 옵저버 비활성화
    if (isInitialLoad || !hasMoreMessages) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loading) {
          console.log("무한스크롤 트리거됨");
          loadMoreMessages();
        }
      },
      {
        root: messagesContainerRef.current,
        rootMargin: "50px 0px 0px 0px",
        threshold: 0.1,
      }
    );

    if (loadingTriggerRef.current) {
      observer.observe(loadingTriggerRef.current);
    }

    return () => {
      if (loadingTriggerRef.current) {
        observer.unobserve(loadingTriggerRef.current);
      }
    };
  }, [isInitialLoad, hasMoreMessages, loading]);

  // 스크롤 위치 감지해서 자동 스크롤 여부 결정
  const handleScroll = useCallback(() => {
    if (isInitialLoad) return; // 초기 로드 중에는 스크롤 감지 비활성화

    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 300;
    setIsAutoScroll(isAtBottom);
  }, [isInitialLoad]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!roomId || !user) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden shadow-sm bg-white relative">
      <div className="bg-teal-50 p-3 border-b border-teal-100">
        <h2 className="font-semibold text-teal-700">1:1 상담</h2>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 relative"
        onScroll={handleScroll}
      >
        {/* 이전 메시지 로딩 영역 */}
        {!isInitialLoad && hasMoreMessages && (
          <div ref={loadingTriggerRef} className="text-center py-2">
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">이전 메시지 불러오기</div>
            )}
          </div>
        )}

        {/* 메시지 목록 */}
        <div className="space-y-3">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === user.id}
            />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* 맨 아래로 스크롤 버튼 */}
      {!isAutoScroll && !isInitialLoad && (
        <div className="absolute bottom-20 right-4 z-10">
          <button
            onClick={scrollToBottom}
            className="bg-white border border-gray-300 text-gray-600 w-10 h-10 rounded-full shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6"></path>
            </svg>
          </button>
        </div>
      )}
      <ChatInput onSendMessage={sendMessage} disabled={!connected} />
    </div>
  );
}
