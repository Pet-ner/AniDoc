"use client";

import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { User, Lock, Calendar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type OnlineStatus = "online" | "away" | "offline";

export default function ProfileSidebar() {
  const { user } = useUser();
  const [status, setStatus] = useState<OnlineStatus>("online");
  const pathname = usePathname();

  const statusInfo = {
    online: { text: "온라인", color: "bg-green-500" },
    away: { text: "자리 비움", color: "bg-yellow-500" },
    offline: { text: "오프라인", color: "bg-red-500" },
  };

  const menuItems = [
    { id: "profile", label: "개인 정보", icon: User, path: "/profile" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="fixed top-0 left-0 w-[240px] h-full bg-white border-r border-gray-200 z-10">
      <div className="h-16 px-5 flex items-center border-b border-gray-200">
        <Link href="/" className="flex items-center">
          <h1 className="text-xl font-semibold text-[#49BEB7]">ANIDOC</h1>
        </Link>
      </div>

      <div className="flex flex-col h-[calc(100%-4rem)] p-4">
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="text-center">
            <h3 className="font-medium">{user?.name || "사용자"}</h3>
            <p className="text-sm text-gray-500">
              {user?.userRole === "ROLE_ADMIN"
                ? "관리자"
                : user?.userRole === "ROLE_STAFF"
                ? "수의사"
                : "일반 사용자"}
            </p>
          </div>{" "}
          <div className="mt-3 relative">
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OnlineStatus)}
                className="w-full text-sm rounded-md border border-gray-200 pl-7 pr-8 py-1.5 shadow-sm appearance-none cursor-pointer"
              >
                {Object.entries(statusInfo).map(([value, info]) => (
                  <option key={value} value={value} className="py-1">
                    {info.text}
                  </option>
                ))}
              </select>
              <div
                className={`w-2.5 h-2.5 rounded-full ${statusInfo[status].color} absolute top-1/2 left-2 -translate-y-1/2`}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>{" "}
        <nav className="py-2 flex-grow">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.id}>
                  <Link href={item.path}>
                    <button
                      className={`flex items-center w-full p-3 text-sm font-medium rounded-lg transition-colors ${
                        active
                          ? "bg-[#EAFFF7] text-[#49BEB7]"
                          : "text-gray-700 hover:bg-[#EAFFF7] hover:text-[#49BEB7]"
                      }`}
                    >
                      <Icon size={20} className="mr-3" />
                      <span>{item.label}</span>
                    </button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
