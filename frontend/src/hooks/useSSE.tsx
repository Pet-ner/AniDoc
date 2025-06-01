import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";

interface Notification {
  id: number;
  type: "NOTICE" | "RESERVATION" | "VACCINATION";
  content: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

interface UseSSEReturn {
  notifications: Notification[];
  connected: boolean;
  unreadCount: number;
  decreaseUnreadCount: () => void;
  resetUnreadCount: () => void;
}

export default function useSSE(): UseSSEReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  // ⭐ 시간 기반 중복 방지로 변경
  const [recentEventTimestamps, setRecentEventTimestamps] = useState<
    Map<number, number>
  >(new Map());
  const { user } = useUser();

  // 서버에서 기존 알림 개수 조회
  const fetchUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications?userId=${user.id}&size=100`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        return;
      }

      if (!response.ok) {
        return;
      }

      if (!contentType || !contentType.includes("application/json")) {
        return;
      }

      const data = await response.json();
      const totalUnreadCount = data.content.filter(
        (n: Notification) => !n.isRead
      ).length;
      setUnreadCount(totalUnreadCount);
    } catch (error) {
      // 배포환경에서는 조용히 처리
    }
  };

  // 알림 목록 새로고침
  const refreshNotifications = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications?userId=${user.id}&size=100`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        return;
      }

      if (!response.ok) {
        return;
      }

      if (!contentType || !contentType.includes("application/json")) {
        return;
      }

      const data = await response.json();
      setNotifications(data.content);
      const totalUnreadCount = data.content.filter(
        (n: Notification) => !n.isRead
      ).length;
      setUnreadCount(totalUnreadCount);
    } catch (error) {
      // 배포환경에서는 조용히 처리
    }
  };

  // ⭐ 중복 체크 함수 - 시간 기반으로 변경
  const isDuplicateEvent = (eventId: number): boolean => {
    const now = Date.now();
    const lastTimestamp = recentEventTimestamps.get(eventId);

    // 같은 ID의 이벤트가 3초 이내에 온 경우만 중복으로 처리
    if (lastTimestamp && now - lastTimestamp < 3000) {
      return true;
    }

    // 새로운 타임스탬프 기록
    setRecentEventTimestamps((prev) => {
      const newMap = new Map(prev);
      newMap.set(eventId, now);

      // 10초 이상 된 기록들 정리
      const cutoffTime = now - 10000;
      for (const [id, timestamp] of newMap.entries()) {
        if (timestamp < cutoffTime) {
          newMap.delete(id);
        }
      }

      return newMap;
    });

    return false;
  };

  // 컴포넌트 마운트 시 기존 읽지 않은 알림 개수 조회
  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
    }
  }, [user?.id]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connect = () => {
      if (!user?.id) {
        return;
      }

      try {
        eventSource = new EventSource(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/connect?userId=${user.id}`,
          { withCredentials: true }
        );

        eventSource.onopen = () => {
          setConnected(true);
          reconnectAttempts = 0;
        };

        // 개별 이벤트 리스너 추가
        eventSource.addEventListener("notice", (event) => {
          handleSSEEvent(event, "NOTICE");
        });

        eventSource.addEventListener("notice-refresh", (event) => {
          refreshNotifications();
          window.dispatchEvent(
            new CustomEvent("notice-refresh", { detail: event.data })
          );
        });

        eventSource.addEventListener("reservation", (event) => {
          handleSSEEvent(event, "RESERVATION");
        });

        eventSource.addEventListener("vaccination", (event) => {
          handleSSEEvent(event, "VACCINATION");
        });

        eventSource.onmessage = (event) => {
          try {
            if (!event.data) {
              return;
            }

            let messageData: any;
            try {
              messageData = JSON.parse(event.data);
            } catch (parseError) {
              return;
            }

            if (messageData.type === "connect") {
              if (messageData.unreadCount !== undefined) {
                setUnreadCount(messageData.unreadCount);
              }
              return;
            }

            if (messageData.type === "heartbeat") {
              return;
            }

            handleNotificationMessage(messageData);
          } catch (error) {
            // 배포환경에서는 조용히 처리
          }
        };

        eventSource.onerror = (error) => {
          setConnected(false);
          eventSource?.close();

          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttempts),
              30000
            );

            setTimeout(() => {
              connect();
            }, delay);
          }
        };
      } catch (error) {
        setConnected(false);
      }
    };

    // ⭐ SSE 이벤트 처리 함수 - 개선된 중복 방지
    const handleSSEEvent = (event: MessageEvent, type: string) => {
      try {
        let eventData: any;
        try {
          if (
            typeof event.data === "string" &&
            event.data.trim().startsWith("<!DOCTYPE html>")
          ) {
            return;
          }

          eventData = event.data ? JSON.parse(event.data) : null;

          if (!eventData) {
            return;
          }

          // ⭐ 시간 기반 중복 체크로 변경
          if (eventData.id && isDuplicateEvent(eventData.id)) {
            return;
          }
        } catch (parseError) {
          return;
        }

        // 알림 새로고침
        refreshNotifications();

        // 타입별 커스텀 이벤트 발생
        switch (type) {
          case "NOTICE":
            window.dispatchEvent(
              new CustomEvent("notice-notification", {
                detail: eventData,
                bubbles: true,
              })
            );
            break;
          case "RESERVATION":
            window.dispatchEvent(
              new CustomEvent("reservation-notification", {
                detail: eventData,
                bubbles: true,
              })
            );
            break;
          case "VACCINATION":
            window.dispatchEvent(
              new CustomEvent("vaccination-notification", {
                detail: eventData,
                bubbles: true,
              })
            );
            break;
        }
      } catch (error) {
        // 배포환경에서는 조용히 처리
      }
    };

    // ⭐ 일반 알림 메시지 처리 함수 - 개선된 중복 방지
    const handleNotificationMessage = (newNotification: any) => {
      if (!newNotification || !newNotification.type) {
        return;
      }

      // ⭐ 시간 기반 중복 체크
      if (newNotification.id && isDuplicateEvent(newNotification.id)) {
        return;
      }

      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === newNotification.id);
        if (exists) {
          return prev;
        }

        if (!newNotification.isRead) {
          setUnreadCount((prevCount) => prevCount + 1);
        }

        return [newNotification, ...prev];
      });
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
        setConnected(false);
      }
    };
  }, [user?.id]);

  // 알림 읽음 처리 시 개수 감소 함수
  const decreaseUnreadCount = () => {
    setUnreadCount((prev) => {
      if (prev <= 0) {
        return 0;
      }
      return prev - 1;
    });
  };

  // 모든 알림 읽음 처리 시 개수 초기화 함수
  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return {
    notifications,
    connected,
    unreadCount,
    decreaseUnreadCount,
    resetUnreadCount,
  };
}
