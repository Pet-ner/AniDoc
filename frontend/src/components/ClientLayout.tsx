"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
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

  const isProfilePage = pathname.includes("/profile");

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
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            padding: "12px 20px",
            maxWidth: "500px",
            width: "max-content",
            whiteSpace: "nowrap",
          },
          success: {
            style: {
              border: "1px solid #10B981",
            },
            iconTheme: {
              primary: "#10B981",
              secondary: "#FFFBEB",
            },
          },
          error: {
            style: {
              border: "1px solid #EF4444",
            },
            iconTheme: {
              primary: "#EF4444",
              secondary: "#FFFBEB",
            },
          },
        }}
      />
      <Sidebar />
      <div className="ml-[240px]">
        <Header />
        <main className="pt-24 px-8 pb-10">{children}</main>
      </div>
    </div>
  );
}
