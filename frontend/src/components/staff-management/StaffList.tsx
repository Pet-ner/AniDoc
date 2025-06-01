"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import StaffApprovalList from "./StaffApprovalList";

type StaffMember = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  emergencyContact?: string;
  status: "ON_DUTY" | "AWAY" | "OFFLINE";
  ssoProvider?: "KAKAO" | "NAVER";
  socialId?: string;
  role: "ROLE_USER" | "ROLE_STAFF" | "ROLE_ADMIN";
};

type PendingStaff = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  emergencyContact?: string;
  ssoProvider?: "KAKAO" | "NAVER";
  socialId?: string;
  role: "ROLE_STAFF";
  requestDate: string;
};

export default function StaffList() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStaffList();
  }, []);

  // 실시간 새로고침을 위한 함수
  const refreshStaffList = () => {
    fetchStaffList();
  };

  const fetchStaffList = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/staff`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("직원 목록을 불러오는데 실패했습니다.");
      }
      const data = await response.json();

      setStaffList(data);
    } catch (error) {
      console.error("Error fetching staff list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status: StaffMember["status"]) => {
    switch (status) {
      case "ON_DUTY":
        return "bg-green-100 text-green-800";
      case "AWAY":
        return "bg-yellow-100 text-yellow-800";
      case "OFFLINE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: StaffMember["status"]) => {
    switch (status) {
      case "ON_DUTY":
        return "근무중";
      case "AWAY":
        return "자리비움";
      case "OFFLINE":
        return "휴무";
      default:
        return "알 수 없음";
    }
  };

  const handleApprove = async (staff: any) => {
    // 승인 처리 후 서버에서 최신 직원 목록을 다시 가져오기
    await fetchStaffList();
  };

  // 필터링된 직원 목록
  const filteredStaff = staffList.filter((staff) =>
    staff.name.toLowerCase().includes(search.toLowerCase())
  );

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredStaff.length / recordsPerPage);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <div className="text-gray-500">직원 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex gap-4">
      {/* 기존 직원 목록 */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // 검색 시 첫 페이지로 이동
                }}
                placeholder="직원 검색"
                className="pr-8 pl-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
              />
              <Search
                size={16}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            <button
              onClick={() => {
                setIsLoading(true);
                fetchStaffList();
              }}
              disabled={isLoading}
              className="p-1.5 rounded-md text-[#49BEB7] hover:bg-[#EAFFF7] transition-colors disabled:opacity-50"
              title="새로고침"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`${isLoading ? "animate-spin" : ""}`}
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
          </div>
          <div className="text-sm text-gray-500">
            총 {filteredStaff.length}명
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  이름
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  이메일
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  연락처
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedStaff.length > 0 ? (
                paginatedStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3">
                      <div className="text-sm font-medium text-[#49BEB7]">
                        {staff.name}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700">
                      {staff.email}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700">
                      {staff.phoneNumber || staff.emergencyContact || "-"}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(
                          staff.status
                        )}`}
                      >
                        {getStatusText(staff.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    {search
                      ? "검색 결과가 없습니다."
                      : "등록된 직원이 없습니다."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              이전
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNum
                        ? "bg-[#49BEB7] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage >= totalPages}
              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 승인 대기 목록 */}
      <StaffApprovalList onApprove={handleApprove} />
    </div>
  );
}
