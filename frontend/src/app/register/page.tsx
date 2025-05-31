"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterRoleSelect() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) return;

    if (selectedRole === "ROLE_USER") {
      router.push("/register/user");
    } else if (selectedRole === "ROLE_STAFF") {
      router.push("/register/staff");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#49BEB7] mb-2">ANIDOC</h1>
          <h2 className="text-gray-600 text-sm">동물병원 관리 시스템</h2>
          <h3 className="mt-6 text-xl font-semibold text-gray-800">회원가입</h3>
          <p className="mt-2 text-sm text-gray-600">가입 유형을 선택해주세요</p>
        </div>

        <div className="mt-8 space-y-4">
          <div
            onClick={() => handleRoleSelect("ROLE_USER")}
            className={`border rounded-lg p-6 cursor-pointer transition-colors duration-200 ${
              selectedRole === "ROLE_USER"
                ? "border-teal-500 bg-teal-50"
                : "border-gray-200 hover:border-teal-300"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">보호자</h3>
                <p className="text-sm text-gray-500 mt-1">
                  반려동물을 건강을 관리하고 진료를 예약하는 사용자
                </p>
              </div>
              {selectedRole === "ROLE_USER" && (
                <span className="bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  ✓
                </span>
              )}
            </div>
          </div>

          <div
            onClick={() => handleRoleSelect("ROLE_STAFF")}
            className={`border rounded-lg p-6 cursor-pointer transition-colors duration-200 ${
              selectedRole === "ROLE_STAFF"
                ? "border-teal-500 bg-teal-50"
                : "border-gray-200 hover:border-teal-300"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">의료진</h3>
                <p className="text-sm text-gray-500 mt-1">
                  진료 기록과 일정을 관리하는 수의사 및 간호사
                </p>
              </div>
              {selectedRole === "ROLE_STAFF" && (
                <span className="bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  ✓
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3 mt-8">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#49BEB7] hover:bg-[#3ea9a2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#49BEB7] disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            계속하기
          </button>

          <Link
            href="/login"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
