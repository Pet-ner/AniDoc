"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Bell,
  Megaphone,
  Calendar,
  Syringe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { formatTimeForNotification } from "@/utils/formatTimeForNotification";
import NotificationsModal from "./NotificationsModal";

interface NotificationDto {
  id: number;
  content: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  data?: {
    noticeId?: number;
    reservationId?: number;
    reservationDate?: string; // 이 필드 추가
    title?: string;
    writerName?: string;
  };
}

// 인터페이스 추가
interface PageInfo {
  content: NotificationDto[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export default function NotificationsList() {
  const router = useRouter();
  const { user } = useUser();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [allNotifications, setAllNotifications] = useState<NotificationDto[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  // 페이징 관련 상태 추가
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [unreadCount, setUnreadCount] = useState(0); // 추가: 전체 알림 중 읽지 않은 알림 수

  // 최근 알림만 가져오는 함수
  const fetchRecentNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications?userId=${user.id}&page=0&size=4`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "알림을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setNotifications(data.content || []);
    } catch (error) {
      console.error("알림 로드 오류:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // 모든 알림을 가져오는 함수 수정
  const fetchAllNotifications = async (page: number = 0) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications?userId=${user.id}&page=${page}&size=${pageSize}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "알림을 불러오는데 실패했습니다.");
      }

      const data: PageInfo = await response.json();
      setAllNotifications(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(data.pageable.pageNumber);
    } catch (error) {
      console.error("전체 알림 로드 오류:", error);
      setAllNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    fetchAllNotifications(newPage);
  };

  // 모달 내 페이징 UI 추가
  const renderPagination = () => {
    return (
      <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-md text-gray-500 disabled:text-gray-300"
        >
          <ChevronLeft size={20} />
        </button>

        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => handlePageChange(idx)}
            className={`w-8 h-8 rounded-full ${
              currentPage === idx
                ? "bg-[#49BEB7] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {idx + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="p-2 rounded-md text-gray-500 disabled:text-gray-300"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  // 모달 부분 수정
  const handleShowAllNotifications = async () => {
    setShowAllNotifications(true);
    await fetchAllNotifications();
  };

  // 모든 알림 읽음 처리 함수
  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/read-all?userId=${user.id}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("알림 전체 읽음 처리에 실패했습니다.");
      }

      // UI 업데이트
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      // 전체 알림 목록도 업데이트
      setAllNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      // 최신 알림 데이터 다시 가져오기
      await fetchRecentNotifications();
      if (showAllNotifications) {
        await fetchAllNotifications(currentPage);
      }
    } catch (error) {
      console.error("알림 전체 읽음 처리 오류:", error);
    }
  };

  useEffect(() => {
    fetchRecentNotifications();
  }, [user]);

  const handleNotificationClick = async (notification: NotificationDto) => {
    try {
      if (!notification.isRead) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/${notification.id}/read`,
          {
            method: "PATCH",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("알림 상태 업데이트에 실패했습니다.");
        }

        // UI 업데이트
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      }

      // 알림 타입에 따른 페이지 이동
      switch (notification.type) {
        case "NOTICE":
          if (notification.data?.noticeId) {
            // noticeId가 있는 경우 직접 이동
            await router.push(`/notices/${notification.data.noticeId}`);
          } else {
            // 제목으로 검색 (수정된 공지사항 처리 개선)
            let title = notification.content;
            let isModified = false;

            // 수정된 공지사항 여부 확인
            if (title.startsWith("[수정]")) {
              isModified = true;
            }

            // 알림 메시지 접두사 제거
            title = title
              .replace("[수정]공지사항이 수정되었습니다: ", "")
              .replace("[수정]공지사항 등록: ", "")
              .replace("[수정]공지사항: ", "")
              .replace("공지사항이 등록되었습니다: ", "")
              .replace("공지사항 등록: ", "")
              .replace("공지사항: ", "")
              .trim();

            try {
              const response = await fetch(
                `${
                  process.env.NEXT_PUBLIC_API_BASE_URL
                }/api/notices/search?title=${encodeURIComponent(title)}`,
                {
                  credentials: "include",
                }
              );

              if (response.ok) {
                const data = await response.json();
                if (data.content && data.content.length > 0) {
                  // 수정된 공지사항인 경우 가장 최근에 수정된 게시글 선택
                  if (isModified) {
                    const sortedNotices = [...data.content].sort(
                      (a, b) =>
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime()
                    );
                    await router.push(`/notices/${sortedNotices[0].id}`);
                  } else {
                    await router.push(`/notices/${data.content[0].id}`);
                  }
                } else {
                  console.error(
                    "해당 제목의 공지사항을 찾을 수 없습니다:",
                    title
                  );
                  await router.push("/notices");
                }
              }
            } catch (error) {
              console.error("공지사항 검색 중 오류:", error);
              await router.push("/notices");
            }
          }
          break;

        case "RESERVATION":
          try {
            // 새로운 예약 등록 알림 처리 (관리자용)
            if (notification.content.includes("새로운 예약이 등록되었습니다")) {
              if (
                user?.userRole === "ROLE_ADMIN" ||
                user?.userRole === "ROLE_STAFF"
              ) {
                if (notification.data?.reservationDate) {
                  await router.push(
                    `/admin/reservations?date=${notification.data.reservationDate}`
                  );
                  return;
                }
                // 공백이 있는 경우도 처리할 수 있도록 정규식 수정
                const dateMatch = notification.content.match(
                  /예약\s*일시:\s*(\d{2})년\s*(\d{2})월\s*(\d{2})일/
                );
                if (dateMatch) {
                  const [_, year, month, day] = dateMatch;
                  const formattedDate = `20${year}-${month}-${day}`;
                  await router.push(
                    `/admin/reservations?date=${formattedDate}`
                  );
                  return;
                }
              }
            }

            // 예약 확정/거절 알림 처리
            if (
              notification.content.includes("예약이 확정되었습니다") ||
              notification.content.includes("예약이 취소되었습니다") ||
              notification.content.includes("예약이 거절되었습니다")
            ) {
              await router.push("/");
              return;
            }

            // 예약 수정 알림 처리
            if (notification.content.includes("예약이 수정되었습니다")) {
              if (notification.data?.reservationId) {
                const path =
                  user?.userRole === "ROLE_ADMIN" ||
                  user?.userRole === "ROLE_STAFF"
                    ? `/admin/reservations/${notification.data.reservationId}`
                    : `/reservation/${notification.data.reservationId}`;
                await router.push(path);
                return;
              }
            }

            // 기존 날짜 기반 이동 로직도 수정
            const dateTimeMatch = notification.content.match(
              /예약\s*일시:\s*(\d+년\s*\d+월\s*\d+일)/
            );
            if (dateTimeMatch) {
              const koreanDate = dateTimeMatch[1];
              const [year, month, day] = koreanDate
                .replace(/년\s*/, "-")
                .replace(/월\s*/, "-")
                .replace("일", "")
                .split("-")
                .map((num) => num.trim().padStart(2, "0"));

              const formattedDate = `20${year}-${month}-${day}`;

              if (
                user?.userRole === "ROLE_ADMIN" ||
                user?.userRole === "ROLE_STAFF"
              ) {
                await router.push(`/admin/reservations?date=${formattedDate}`);
              } else {
                await router.push(`/reservation?date=${formattedDate}`);
              }
            }
          } catch (error) {
            console.error("예약 페이지 이동 중 오류:", error);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("알림 처리 오류:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NOTICE":
        return <Megaphone size={16} className="text-gray-500" />;
      case "RESERVATION":
        return <Calendar size={16} className="text-gray-500" />;
      case "VACCINATION":
        return <Syringe size={16} className="text-gray-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-5">
        {/* 헤더 추가 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">최근 알림</h2>
            {unreadCount > 0 && (
              <span className="text-sm text-gray-500">({unreadCount})</span>
            )}
          </div>
        </div>

        {/* 기존 알림 목록 */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-center text-gray-500 py-4">로딩 중...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              새로운 알림이 없습니다.
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="border-b border-gray-100 pb-2 last:border-0"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start py-2 cursor-pointer hover:bg-gray-50">
                  {/* 읽음/안읽음 상태 표시 점 */}
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-[#49BEB7] flex-shrink-0 mt-2 mr-3" />
                  )}
                  {/* 이모지 */}
                  <div className="mr-3">
                    {notification.type === "NOTICE" ? (
                      <Megaphone className="text-blue-500" size={20} />
                    ) : notification.type === "RESERVATION" ? (
                      <Calendar className="text-teal-500" size={20} />
                    ) : (
                      <Bell className="text-gray-500" size={20} />
                    )}
                  </div>
                  {/* 컨텐츠 영역 */}
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

        {/* 기존 모든 알림 보기 버튼 */}
        <div className="mt-3 text-center">
          <button
            onClick={handleShowAllNotifications}
            className="text-sm text-[#49BEB7] hover:underline"
          >
            모든 알림 보기
          </button>
        </div>
      </div>

      {/* 기존 NotificationsModal */}
      {showAllNotifications && (
        <NotificationsModal
          isOpen={showAllNotifications}
          onClose={() => setShowAllNotifications(false)}
          notifications={allNotifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllAsRead}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
