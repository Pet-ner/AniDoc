"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Bell, User, ChevronDown } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  // 현재 경로에 따른 페이지 제목 설정
  const getPageTitle = () => {
    const routes: { [key: string]: string } = {
      "/": "대시보드",
      "/reservation": "진료 예약",
      "/pets": "반려동물 관리",
      "/medical-records": "진료 기록",
      "/chats": "1:1 채팅",
    };

    return routes[pathname] || "진료 예약";
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 fixed top-0 left-[240px] right-0 z-10">
      <h1 className="text-xl font-medium">{getPageTitle()}</h1>

      <div className="ml-auto flex items-center space-x-4">
        {/* 알림 */}
        <div className="relative">
          <button
            className="relative p-2 rounded-full hover:bg-gray-100"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={22} className="text-gray-600" />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              2
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
              <div className="p-3 border-b border-gray-200 font-medium">
                알림
              </div>
              <div className="max-h-80 overflow-y-auto">
                <NotificationItem
                  title="진료예약 4/2 오후 2시 확정되었습니다."
                  time="3분 전"
                />
                <NotificationItem
                  title="네이버 예방접종 일정이 다가오고 있습니다."
                  time="10시간 전"
                  isRead={true}
                />
              </div>
              <div className="p-2 border-t border-gray-200 text-center">
                <button className="text-sm text-teal-500 hover:underline">
                  모든 알림 보기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 프로필 */}
        <div className="relative">
          <button
            className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-full"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden">
              <User size={18} className="text-teal-600" />
            </div>
            <span className="text-gray-700">{user.name}</span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
              <div className="p-3 border-b border-gray-200">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">
                  {user.role === "ROLE_ADMIN"
                    ? "관리자"
                    : user.role === "ROLE_STAFF"
                    ? "의료진"
                    : "일반 사용자"}
                </p>
              </div>
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
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
    </header>
  );
}

function NotificationItem({
  title,
  time,
  isRead = false,
}: {
  title: string;
  time: string;
  isRead?: boolean;
}) {
  return (
    <div
      className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${
        isRead ? "bg-gray-50" : "bg-white"
      }`}
    >
      <div className="flex items-start">
        {!isRead && (
          <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 mr-2 flex-shrink-0"></div>
        )}
        <div className={`flex-1 ${isRead ? "pl-4" : ""}`}>
          <p className={`${isRead ? "text-gray-500" : "text-gray-800"}`}>
            {title}
          </p>
          <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
      </div>
    </div>
  );
}
