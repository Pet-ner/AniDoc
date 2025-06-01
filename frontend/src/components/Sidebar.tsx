"use client";

import { usePathname, useRouter } from "next/navigation";
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
  Megaphone,
  Package,
  Syringe,
  Users,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  if (!user) return null;

  // "bg-teal-100 text-teal-600"
  // bg-[#AFFFDF] text-[#49BEB7]
  // bg-[#AFFFDF] text-teal-600
  const isActive = (path: string) => {
    const isMatch = pathname === path || pathname.startsWith(`${path}/`);
    return isMatch
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
            {user.userRole === "ROLE_ADMIN" && (
              <Link
                href="/staff-management"
                className={`flex items-center p-3 rounded-lg ${isActive(
                  "/staff-management"
                )}`}
              >
                <Users size={20} className="mr-3" />
                <span>직원 관리</span>
              </Link>
            )}
          </li>
          <li>
            <Link
              href={user?.userRole === "ROLE_USER" ? "/ownerpet" : "/doctorpet"}
              className={`flex items-center p-3 rounded-lg ${isActive(
                user?.userRole === "ROLE_USER" ? "/ownerpet" : "/doctorpet"
              )}`}
            >
              <Dog size={20} className="mr-3" />
              <span>반려동물 관리</span>
            </Link>
          </li>
          <li>
            {user.userRole === "ROLE_USER" ? (
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
            {(user.userRole === "ROLE_STAFF" ||
              user.userRole === "ROLE_ADMIN") && (
              <Link
                href="/doctorpetvaccine"
                className={`flex items-center p-3 rounded-lg ${isActive(
                  "/doctorpetvaccine"
                )}`}
              >
                <Syringe size={20} className="mr-3" />
                <span>접종 관리</span>
              </Link>
            )}
          </li>
          {user.userRole === "ROLE_ADMIN" && (
            <li>
              <Link
                href="/medicines"
                className={`flex items-center p-3 rounded-lg ${isActive(
                  "/medicines"
                )}`}
              >
                <Package size={20} className="mr-3" />
                <span>약품 재고 관리</span>
              </Link>
            </li>
          )}

          <li>
            <Link
              href="/notices"
              className={`flex items-center p-3 rounded-lg ${isActive(
                "/notices"
              )}`}
            >
              <Megaphone size={20} className="mr-3" />
              <span>공지사항</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
