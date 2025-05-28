"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // 로그인 페이지 여부 확인
  const isAuthPage =
    pathname === "/login" ||
    pathname.includes("/register") ||
    pathname.includes("/auth-register");

  // 로그인 페이지는 Sidebar와 Header 표시하지 않음
  if (isAuthPage) {
    return <>{children}</>;
  }

  // 프로필 페이지는 Sidebar만 숨김
  if (isProfilePage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="ml-[240px]">
          <Header />
          <main className="pt-24 px-8 pb-10">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[240px]">
        <Header />
        <main className="pt-24 px-8 pb-10">{children}</main>
      </div>
    </div>
  );
}
