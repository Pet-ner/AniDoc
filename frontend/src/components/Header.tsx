"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import {
  Bell,
  Calendar,
  Megaphone,
  User,
  ChevronDown,
  Syringe,
} from "lucide-react";
import NotificationsModal from "./NotificationsModal";
import NotificationsList from "@/components/NotificationsList";
import { formatTimeForNotification } from "@/utils/formatTimeForNotification";
import useSSE from "@/hooks/useSSE";

interface NotificationDto {
  id: number;
  content: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  data?: {
    noticeId?: number;
    title?: string;
    writerName?: string;
    reservationId?: number;
    reservationDate?: string;
    reservationTime?: string;
    petId?: number;
    petName?: string;
    vaccineName?: string;
    nextDueDate?: string;
    round?: number;
    scheduleWeeks?: string;
  };
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  // useSSE 훅에서 상태 가져오기 (실시간 갱신)
  const {
    notifications: sseNotifications,
    unreadCount: sseUnreadCount,
    connected,
    decreaseUnreadCount,
    resetUnreadCount,
  } = useSSE();

  // 서버에서 가져온 전체 알림 목록 (드롭다운용)
  const [serverNotifications, setServerNotifications] = useState<
    NotificationDto[]
  >([]);

  // 전체 알림 모달용 상태
  const [allNotifications, setAllNotifications] = useState<NotificationDto[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // 현재 경로에 따른 페이지 제목 설정
  const getPageTitle = () => {
    if (pathname.startsWith("/notices")) {
      return "공지사항";
    }

    const routes: { [key: string]: string } = {
      "/": "대시보드",
      "/reservation": "진료 예약",
      "/ownerpet": "반려동물 관리",
      "/doctorpet": "반려동물 관리",
      "/medical-records": "진료 기록",
      "/doctorpetvaccine": "접종 관리",
      "/chats": "1:1 채팅",
      "/admin/reservations": "예약 관리",
      "/profile": "계정 설정",
      "/staff-management": "직원 관리",
    };

    return routes[pathname] || "진료 예약";
  };

  // 서버에서 알림 목록 조회 (드롭다운용)
  const fetchServerNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications?userId=${user.id}&size=20`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("알림을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      const sortedNotifications = data.content.sort(
        (a: NotificationDto, b: NotificationDto) => {
          if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      );

      setServerNotifications(sortedNotifications);
    } catch (error) {
      console.error("서버 알림 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 알림 드롭다운이 열릴 때 서버에서 최신 알림 조회
  useEffect(() => {
    if (showNotifications && user) {
      fetchServerNotifications();
    }
  }, [user, showNotifications]);

  // SSE로 받은 새 알림 처리
  useEffect(() => {
    console.log("SSE 새 알림 수신:", sseNotifications);

    if (sseNotifications.length > 0) {
      const latestNotification = sseNotifications[0];

      // 서버 알림 목록에 새 알림 추가 (중복 방지)
      setServerNotifications((prev) => {
        const exists = prev.some((n) => n.id === latestNotification.id);
        if (exists) return prev;

        const updatedNotifications = [latestNotification, ...prev];
        return Array.from(
          new Map(updatedNotifications.map((item) => [item.id, item])).values()
        ).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      // 전체 알림 모달에도 새 알림 추가
      setAllNotifications((prev) => {
        const exists = prev.some((n) => n.id === latestNotification.id);
        if (exists) return prev;

        return [latestNotification, ...prev];
      });
    }
  }, [sseNotifications]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 알림 클릭 핸들러
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

        // 읽지 않은 알림 개수 감소
        decreaseUnreadCount();

        // 서버 알림 상태 업데이트
        setServerNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );

        // 전체 알림 모달의 상태도 업데이트
        setAllNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      }

      // 알림 드롭다운 닫기
      setShowNotifications(false);
      setShowAllNotifications(false);

      // 알림 타입에 따른 페이지 이동
      switch (notification.type) {
        case "NOTICE":
          if (notification.data?.noticeId) {
            await router.push(`/notices/${notification.data.noticeId}`);
          } else {
            let title = notification.content;
            let isModified = false;

            if (title.startsWith("[수정]")) {
              isModified = true;
              title = title.replace("[수정]", "").trim();
            }

            title = title
              .replace("공지사항이 수정되었습니다: ", "")
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
            if (notification.content.includes("새로운 예약이 등록되었습니다")) {
              if (
                user?.userRole === "ROLE_ADMIN" ||
                user?.userRole === "ROLE_STAFF"
              ) {
                if (notification.data?.reservationDate) {
                  window.location.href = `/admin/reservations?date=${notification.data.reservationDate}`;
                  return;
                }

                const dateMatch = notification.content.match(
                  /예약\s*일시:\s*(\d{2})년\s*(\d{2})월\s*(\d{2})일/
                );

                if (dateMatch) {
                  const [_, year, month, day] = dateMatch;
                  const formattedDate = `20${year}-${month}-${day}`;
                  window.location.href = `/admin/reservations?date=${formattedDate}`;
                  return;
                }
              }
            }

            if (
              notification.content.includes("예약이 확정되었습니다") ||
              notification.content.includes("예약이 취소되었습니다") ||
              notification.content.includes("예약이 거절되었습니다")
            ) {
              window.location.href = "/";
              return;
            }

            if (notification.content.includes("예약이 수정되었습니다")) {
              if (notification.data?.reservationId) {
                const path =
                  user?.userRole === "ROLE_ADMIN" ||
                  user?.userRole === "ROLE_STAFF"
                    ? `/admin/reservations/${notification.data.reservationId}`
                    : `/reservation/${notification.data.reservationId}`;
                window.location.href = path;
                return;
              }
            }

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
                window.location.href = `/admin/reservations?date=${formattedDate}`;
              } else {
                window.location.href = `/reservation?date=${formattedDate}`;
              }
            } else {
              // 모든 날짜 파싱 실패 시 기본 페이지로 이동
              const today = new Date().toISOString().split("T")[0];
              window.location.href = `/admin/reservations?date=${today}`;
            }
          } catch (error) {
            console.error("예약 페이지 이동 중 오류:", error);
          }
          break;

        case "VACCINATION":
          try {
            if (notification.data?.petId) {
              await router.push(`/ownerpet/${notification.data.petId}`);
            } else {
              await router.push("/ownerpet");
            }
          } catch (error) {
            console.error("반려동물 페이지 이동 중 오류:", error);
            await router.push("/ownerpet");
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("알림 처리 오류:", error);
    }
  };

  // 전체 알림 데이터 조회 함수
  const fetchAllNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications?userId=${user.id}&size=10&page=0`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("알림을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setAllNotifications(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(0);
    } catch (error) {
      console.error("알림 로드 오류:", error);
    } finally {
      setLoading(false);
    }
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

      // 읽지 않은 알림 개수 초기화
      resetUnreadCount();

      // UI 업데이트
      setAllNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setServerNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error("알림 전체 읽음 처리 오류:", error);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = async (page: number) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications?userId=${user.id}&size=10&page=${page}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("알림을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setAllNotifications(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("알림 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // showAllNotifications 상태가 변경될 때 전체 알림 데이터 조회
  useEffect(() => {
    if (showAllNotifications) {
      handlePageChange(currentPage);
    }
  }, [showAllNotifications]);

  // 알림 아이콘 함수
  const getNotificationIcon = (notification: NotificationDto) => {
    if (notification.type === "NOTICE") {
      return <Megaphone className="text-blue-500" size={20} />;
    }
    if (notification.type === "RESERVATION") {
      return <Calendar className="text-teal-500" size={20} />;
    }
    if (notification.type === "VACCINATION") {
      return <Syringe className="text-purple-500" size={20} />;
    }
    return <Bell className="text-gray-500" size={20} />;
  };

  // 알림 내용 렌더링 함수
  const renderNotificationContent = (notification: NotificationDto) => {
    if (notification.type === "VACCINATION" && notification.data) {
      return (
        <div>
          <p
            className={`text-sm ${
              notification.isRead ? "text-gray-500" : "text-gray-800"
            }`}
          >
            {notification.content}
          </p>
          {notification.data.nextDueDate && (
            <p className="text-xs text-gray-600 mt-1">
              예정일: {notification.data.nextDueDate}
            </p>
          )}
          {notification.data.scheduleWeeks && (
            <p className="text-xs text-gray-600">
              {notification.data.scheduleWeeks}
            </p>
          )}
        </div>
      );
    }

    return (
      <p
        className={`text-sm ${
          notification.isRead ? "text-gray-500" : "text-gray-800"
        }`}
      >
        {notification.content}
      </p>
    );
  };

  // 알림 스타일 함수
  const getNotificationStyle = (notification: NotificationDto) => {
    const baseStyle =
      "p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer";

    if (notification.type === "VACCINATION" && !notification.isRead) {
      return `${baseStyle} bg-green-50 border-l-4 border-l-green-500`;
    }

    return baseStyle;
  };

  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 fixed top-0 left-[240px] right-0 z-10">
      <h1 className="text-xl font-medium">{getPageTitle()}</h1>

      <div className="ml-auto flex items-center space-x-4">
        {/* 알림 - useSSE의 unreadCount 직접 사용 */}
        <div className="relative" ref={notificationRef}>
          <button
            className="relative p-2 rounded-full hover:bg-gray-100"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={22} className="text-gray-600" />
            {/* SSE에서 받은 실시간 unreadCount 사용 */}
            {sseUnreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {sseUnreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="font-medium">알림</span>
                  {sseUnreadCount > 0 && (
                    <span className="text-sm text-gray-500">
                      ({sseUnreadCount})
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    알림을 불러오는 중...
                  </div>
                ) : serverNotifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    새로운 알림이 없습니다.
                  </div>
                ) : (
                  <>
                    {/* 새로운 알림 섹션 */}
                    {serverNotifications.some((n) => !n.isRead) && (
                      <div>
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">
                            새로운 알림
                          </span>
                          {sseUnreadCount > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAllAsRead();
                              }}
                              className="text-sm text-[#49BEB7] hover:text-[#3ea9a2] transition-colors duration-200"
                            >
                              모두 읽음
                            </button>
                          )}
                        </div>
                        {/* 안읽은 알림 */}
                        {serverNotifications
                          .filter((n) => !n.isRead)
                          .map((notification) => (
                            <div
                              key={notification.id}
                              className={getNotificationStyle(notification)}
                              onClick={() =>
                                handleNotificationClick(notification)
                              }
                            >
                              <div className="flex items-start">
                                <div className="mr-3">
                                  {getNotificationIcon(notification)}
                                </div>
                                <div className="flex-1">
                                  {renderNotificationContent(notification)}
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatTimeForNotification(
                                      notification.createdAt
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* 읽은 알림 */}
                    {serverNotifications.some((n) => n.isRead) && (
                      <div>
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">
                            읽은 알림
                          </span>
                        </div>
                        {serverNotifications
                          .filter((n) => n.isRead)
                          .map((notification) => (
                            <div
                              key={notification.id}
                              className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                              onClick={() =>
                                handleNotificationClick(notification)
                              }
                            >
                              <div className="flex items-start">
                                <div className="mr-3">
                                  {getNotificationIcon(notification)}
                                </div>
                                <div className="flex-1">
                                  {renderNotificationContent(notification)}
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatTimeForNotification(
                                      notification.createdAt
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="p-2 border-t border-gray-200 text-center">
                <button
                  onClick={() => {
                    setShowAllNotifications(true);
                    setShowNotifications(false);
                  }}
                  className="text-sm text-[#49BEB7] hover:text-[#3ea9a2] transition-colors duration-200"
                >
                  모든 알림 보기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 프로필 */}
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-full"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
              <User size={18} className="text-teal-600" />
            </div>
            <span className="text-gray-700">
              {user?.name || "사용자"}
              {user?.userRole === "ROLE_STAFF" && " 의료진"}
              {user?.userRole === "ROLE_USER" && " 보호자"}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
              <div className="p-3 border-b border-gray-200">
                <p className="font-medium">{user?.name || "사용자"}</p>
                <p className="text-sm text-gray-500">
                  {user?.userRole === "ROLE_ADMIN"
                    ? "관리자"
                    : user?.userRole === "ROLE_STAFF"
                    ? "의료진"
                    : "일반 사용자"}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  계정 설정
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={logout}
                >
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 전체 알림 모달 */}
      <NotificationsModal
        isOpen={showAllNotifications}
        onClose={() => setShowAllNotifications(false)}
        notifications={allNotifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={handleMarkAllAsRead}
        onPageChange={handlePageChange}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </header>
  );
}
