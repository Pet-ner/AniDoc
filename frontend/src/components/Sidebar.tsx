"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import {
  Home,
  Calendar,
  MessageSquare,
  Dog,
  FilePen,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  if (!user) return null;

  // "bg-teal-100 text-teal-600"
  // bg-[#AFFFDF] text-[#49BEB7]
  // bg-[#AFFFDF] text-teal-600
  const isActive = (path: string) => {
    return pathname === path
      ? "bg-teal-100 text-teal-600"
      : "hover:bg-gray-100 text-gray-700";
  };

  return (
    <aside className="fixed top-0 left-0 w-[240px] h-full bg-white border-r border-gray-200 z-10">
      <div className="h-16 px-5 flex items-center border-b border-gray-200">
        <Link href="/" className="flex items-center">
          <h1 className="text-xl font-semibold text-[#49BEB7]">ANIDOC</h1>
        </Link>
      </div>
      <nav className="py-6 px-3">
        <ul className="space-y-1">
          <li>
            <Link
              href="/"
              className={`flex items-center p-3 rounded-lg ${isActive("/")}`}
            >
              <Home size={20} className="mr-3" />
              <span>대시보드</span>
            </Link>
          </li>
          <li>
            <Link
              href="/pets"
              className={`flex items-center p-3 rounded-lg ${isActive(
                "/pets"
              )}`}
            >
              <Dog size={20} className="mr-3" />
              <span>반려동물 관리</span>
            </Link>
          </li>
          <li>
            {user.role === "ROLE_USER" ? (
              <Link
                href="/reservation"
                className={`flex items-center p-3 rounded-lg ${isActive(
                  "/reservation"
                )}`}
              >
                <Calendar size={20} className="mr-3" />
                <span>진료 예약</span>
              </Link>
            ) : (
              <Link
                href="/admin/reservations"
                className={`flex items-center p-3 rounded-lg ${isActive(
                  "/admin/reservations"
                )}`}
              >
                <Calendar size={20} className="mr-3" />
                <span>예약 관리</span>
              </Link>
            )}
          </li>

          <li>
            <Link
              href="/medical-records"
              className={`flex items-center p-3 rounded-lg ${isActive(
                "/medical-records"
              )}`}
            >
              <FilePen size={20} className="mr-3" />
              <span>진료 기록</span>
            </Link>
          </li>
          <li>
            <Link
              href="/chats"
              className={`flex items-center p-3 rounded-lg ${isActive(
                "/chats"
              )}`}
            >
              <MessageSquare size={20} className="mr-3" />
              <span>1:1 채팅</span>
              {/* 안읽은 메시지 수 */}
              {/* <div className="ml-auto bg-red-500 text-white rounded-full text-xs px-2 py-1">
                2
              </div> */}
            </Link>
          </li>
        </ul>
      </nav>

      {/* 테스트용 유저 전환 */}
      <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">테스트 사용자</p>
        <div className="flex flex-col gap-1">
          <UserSwitchButton id={1} label="일반 사용자" />
          <UserSwitchButton id={2} label="의료진" />
          <UserSwitchButton id={3} label="관리자" />
        </div>
      </div>
    </aside>
  );
}

// 테스트용 유저 변경
function UserSwitchButton({ id, label }: { id: number; label: string }) {
  const { user, login } = useUser();
  const isCurrentUser = user?.id === id;

  return (
    <button
      onClick={() => login(id)}
      className={`flex items-center justify-between p-2 text-sm rounded ${
        isCurrentUser
          ? "bg-teal-100 text-teal-600"
          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
      }`}
    >
      <span>{label}</span>
      {isCurrentUser && <ChevronRight size={16} />}
    </button>
  );
}
