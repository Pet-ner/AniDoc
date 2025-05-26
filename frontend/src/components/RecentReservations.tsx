"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  ClipboardEdit,
  Clock,
} from "lucide-react";
import { formatTimeForNotification } from "@/utils/formatTimeForNotification";

interface ReservationNotification {
  id: number;
  content: string;
  createdAt: string;
  type: "RESERVATION"; // RESERVATION 타입으로 고정
  isRead: boolean; // 추가
}

const getReservationIcon = (content: string) => {
  if (content.includes("확정되었습니다")) {
    return <CheckCircle2 className="text-green-500" size={20} />;
  }
  if (
    content.includes("거절되었습니다") ||
    content.includes("취소되었습니다")
  ) {
    return <XCircle className="text-red-500" size={20} />;
  }
  if (content.includes("변경되었습니다")) {
    return <ClipboardEdit className="text-amber-500" size={20} />;
  }
  if (content.includes("등록되었습니다")) {
    return <Clock className="text-blue-500" size={20} />;
  }
  return <Calendar className="text-gray-500" size={20} />;
};

const isWithinLastWeek = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= weekAgo;
};

export default function RecentReservations() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<ReservationNotification[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // 날짜 추출 함수 추가
  const extractDateFromContent = (content: string) => {
    const match = content.match(/\d{2}년\s*\d{1,2}월\s*\d{1,2}일/);
    if (match) {
      const dateStr = match[0];
      const [year, month, day] = dateStr
        .replace(/년\s*/, "-")
        .replace(/월\s*/, "-")
        .replace("일", "")
        .split("-")
        .map((num) => num.trim().padStart(2, "0"));
      return `20${year}-${month}-${day}`;
    }
    return null;
  };

  // 알림 클릭 핸들러 추가
  const handleNotificationClick = async (
    notification: ReservationNotification
  ) => {
    const dateStr = extractDateFromContent(notification.content);
    if (dateStr) {
      // 읽음 처리 API 호출
      if (!notification.isRead) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/${notification.id}/read`,
            {
              method: "PATCH",
              credentials: "include",
            }
          );

          if (response.ok) {
            // 로컬 상태 업데이트
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === notification.id ? { ...n, isRead: true } : n
              )
            );
          }
        } catch (error) {
          console.error("알림 읽음 처리 오류:", error);
        }
      }

      // 페이지 이동
      if (user?.userRole === "ROLE_ADMIN" || user?.userRole === "ROLE_STAFF") {
        router.push(`/admin/reservations?date=${dateStr}`);
      } else {
        router.push(`/reservation?date=${dateStr}`);
      }
    }
  };

  useEffect(() => {
    const fetchReservationNotifications = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // type=RESERVATION 파라미터로 예약 알림만 요청
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications?userId=${user.id}&type=RESERVATION&size=50`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("예약 알림을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        // 최근 7일 이내의 예약 알림만 필터링
        const recentNotifications = data.content.filter(
          (n: ReservationNotification) =>
            n.type === "RESERVATION" && isWithinLastWeek(n.createdAt)
        );

        setNotifications(recentNotifications);
      } catch (error) {
        console.error("예약 알림 로드 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservationNotifications();
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">최근 예약</h2>
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
        <div className="space-y-2">
          {loading ? (
            <p className="text-center text-gray-500 py-4">로딩 중...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              최근 7일간의 예약 알림이 없습니다.
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="border-b border-gray-100 pb-2 last:border-0"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start py-2 hover:bg-gray-50 cursor-pointer">
                  <div className="mr-3">
                    {getReservationIcon(notification.content)}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        notification.isRead ? "text-gray-500" : "text-gray-800"
                      }`}
                    >
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeForNotification(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
