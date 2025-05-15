import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

interface Message {
  id: number;
  roomId: number;
  senderId: number;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface UseWebSocketProps {
  roomId: number | null;
  userId: number | null;
}

export default function useWebSocket({ roomId, userId }: UseWebSocketProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  // 메시지 불러오기
  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/rooms/${roomId}/messages`
        );

        if (!response.ok) {
          throw new Error("메시지 로드 실패");
        }

        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("메시지 로드 오류:", error);
      }
    };

    fetchMessages();
  }, [roomId]);

  // 웹소켓 연결
  useEffect(() => {
    if (!roomId || !userId) return;

    const connect = () => {
      const client = new Client({
        webSocketFactory: () =>
          new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ws-stomp`),
        debug: (str) => console.log(str),
        reconnectDelay: 5000,
      });

      client.onConnect = () => {
        console.log("WebSocket 연결 성공");
        setConnected(true);

        // 채팅방 구독
        client.subscribe(`/sub/chat/room/${roomId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });

        // 메시지 읽음 처리
        markAsRead();
      };

      client.onStompError = (frame) => {
        console.error("STOMP 에러:", frame.headers.message);
        setConnected(false);
      };

      client.activate();
      clientRef.current = client;
    };

    connect();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [roomId, userId]);

  // 메시지 읽음 처리
  const markAsRead = async () => {
    if (!roomId || !userId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/rooms/${roomId}/read?userId=${userId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("메시지 읽음 처리 실패");
      }
    } catch (error) {
      console.error("메시지 읽음 처리 오류:", error);
    }
  };

  // 메시지 전송
  const sendMessage = (content: string) => {
    if (!content.trim() || !connected || !roomId || !userId) return;

    const message = {
      roomId,
      senderId: userId,
      content,
    };

    if (clientRef.current) {
      clientRef.current.publish({
        destination: "/pub/chat/message",
        body: JSON.stringify(message),
      });
    }
  };

  return {
    messages,
    connected,
    sendMessage,
  };
}
