"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import StaffApprovalList from "./StaffApprovalList";

type StaffMember = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  emergencyContact?: string;
  status: "ON_DUTY" | "AWAY" | "OFF";
  ssoProvider?: "GOOGLE" | "KAKAO" | "NAVER";
  socialId?: string;
  role: "ROLE_USER" | "ROLE_STAFF" | "ROLE_ADMIN";
};

type PendingStaff = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  emergencyContact?: string;
  ssoProvider?: "GOOGLE" | "KAKAO" | "NAVER";
  socialId?: string;
  role: "ROLE_STAFF";
  requestDate: string;
};

// 임시 데이터
const mockStaffData: StaffMember[] = [
  {
    id: 1,
    name: "김의사",
    email: "doctor.kim@anidoc.com",
    phoneNumber: "010-1234-5678",
    emergencyContact: "010-1111-1111",
    status: "ON_DUTY",
    ssoProvider: "GOOGLE",
    socialId: "123456789",
    role: "ROLE_STAFF",
  },
  {
    id: 2,
    name: "이간호",
    email: "nurse.lee@anidoc.com",
    phoneNumber: "010-2345-6789",
    emergencyContact: "010-2222-2222",
    status: "OFF",
    ssoProvider: "KAKAO",
    socialId: "987654321",
    role: "ROLE_STAFF",
  },
  {
    id: 3,
    name: "박수사",
    email: "doctor.park@anidoc.com",
    phoneNumber: "010-3456-7890",
    emergencyContact: "010-3333-3333",
    status: "AWAY",
    ssoProvider: "NAVER",
    socialId: "456789123",
    role: "ROLE_STAFF",
  },
  {
    id: 4,
    name: "최수의",
    email: "doctor.choi@anidoc.com",
    phoneNumber: "010-4567-8901",
    emergencyContact: "010-4444-4444",
    status: "ON_DUTY",
    role: "ROLE_STAFF",
  },
  {
    id: 5,
    name: "정간호",
    email: "nurse.jung@anidoc.com",
    phoneNumber: "010-5678-9012",
    emergencyContact: "010-5555-5555",
    status: "AWAY",
    role: "ROLE_STAFF",
  },
  {
    id: 6,
    name: "강수의",
    email: "doctor.kang@anidoc.com",
    phoneNumber: "010-6789-0123",
    emergencyContact: "010-6666-6666",
    status: "OFF",
    role: "ROLE_STAFF",
  },
  {
    id: 7,
    name: "윤수의",
    email: "doctor.yoon@anidoc.com",
    phoneNumber: "010-7890-1234",
    emergencyContact: "010-7777-7777",
    status: "ON_DUTY",
    role: "ROLE_STAFF",
  },
  {
    id: 8,
    name: "장간호",
    email: "nurse.jang@anidoc.com",
    phoneNumber: "010-8901-2345",
    emergencyContact: "010-8888-8888",
    status: "AWAY",
    role: "ROLE_STAFF",
  },
  {
    id: 9,
    name: "임수의",
    email: "doctor.lim@anidoc.com",
    phoneNumber: "010-9012-3456",
    emergencyContact: "010-9999-9999",
    status: "OFF",
    role: "ROLE_STAFF",
  },
  {
    id: 10,
    name: "한수의",
    email: "doctor.han@anidoc.com",
    phoneNumber: "010-0123-4567",
    emergencyContact: "010-0000-0000",
    status: "ON_DUTY",
    role: "ROLE_STAFF",
  },
  {
    id: 11,
    name: "송간호",
    email: "nurse.song@anidoc.com",
    phoneNumber: "010-1234-5679",
    emergencyContact: "010-1111-2222",
    status: "AWAY",
    role: "ROLE_STAFF",
  },
  {
    id: 12,
    name: "조수의",
    email: "doctor.cho@anidoc.com",
    phoneNumber: "010-2345-6780",
    emergencyContact: "010-2222-3333",
    status: "OFF",
    role: "ROLE_STAFF",
  },
  {
    id: 13,
    name: "백수의",
    email: "doctor.baek@anidoc.com",
    phoneNumber: "010-3456-7891",
    emergencyContact: "010-3333-4444",
    status: "ON_DUTY",
    role: "ROLE_STAFF",
  },
  {
    id: 14,
    name: "고간호",
    email: "nurse.ko@anidoc.com",
    phoneNumber: "010-4567-8902",
    emergencyContact: "010-4444-5555",
    status: "AWAY",
    role: "ROLE_STAFF",
  },
  {
    id: 15,
    name: "남수의",
    email: "doctor.nam@anidoc.com",
    phoneNumber: "010-5678-9013",
    emergencyContact: "010-5555-6666",
    status: "OFF",
    role: "ROLE_STAFF",
  },
];

// 승인 대기 목록 임시 데이터
const mockPendingStaffData: PendingStaff[] = [
  {
    id: 1,
    name: "신입의사",
    email: "new.doctor@anidoc.com",
    phoneNumber: "010-1111-2222",
    emergencyContact: "010-3333-4444",
    role: "ROLE_STAFF",
    requestDate: "2024-03-15",
  },
  {
    id: 2,
    name: "신입간호",
    email: "new.nurse@anidoc.com",
    phoneNumber: "010-5555-6666",
    emergencyContact: "010-7777-8888",
    role: "ROLE_STAFF",
    requestDate: "2024-03-16",
  },
  {
    id: 3,
    name: "김신입",
    email: "new.kim@anidoc.com",
    phoneNumber: "010-9999-0000",
    emergencyContact: "010-1111-3333",
    role: "ROLE_STAFF",
    requestDate: "2024-03-17",
  },
];

export default function StaffList() {
  const [staffList, setStaffList] = useState<StaffMember[]>(mockStaffData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const getStatusBadgeColor = (status: StaffMember["status"]) => {
    switch (status) {
      case "ON_DUTY":
        return "bg-green-100 text-green-800";
      case "AWAY":
        return "bg-yellow-100 text-yellow-800";
      case "OFF":
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
      case "OFF":
        return "휴무";
      default:
        return "알 수 없음";
    }
  };

  const handleApprove = (staff: any) => {
    setStaffList((prev) => [
      ...prev,
      {
        ...staff,
        status: "OFF", // 기본 상태는 휴무로 설정
      },
    ]);
  };

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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="직원 검색"
                className="pr-8 pl-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
              />
              <Search
                size={16}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
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
                  비상연락망
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffList
                .filter((staff) =>
                  staff.name.toLowerCase().includes(search.toLowerCase())
                )
                .slice(
                  (currentPage - 1) * recordsPerPage,
                  currentPage * recordsPerPage
                )
                .map((staff) => (
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
                      {staff.phoneNumber}
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
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            이전
          </button>
          <div className="flex gap-1">
            {Array.from(
              {
                length: Math.ceil(
                  staffList.filter((staff) =>
                    staff.name.toLowerCase().includes(search.toLowerCase())
                  ).length / recordsPerPage
                ),
              },
              (_, i) => i + 1
            ).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === pageNum
                    ? "bg-[#49BEB7] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  prev + 1,
                  Math.ceil(
                    staffList.filter((staff) =>
                      staff.name.toLowerCase().includes(search.toLowerCase())
                    ).length / recordsPerPage
                  )
                )
              )
            }
            disabled={
              currentPage >=
              Math.ceil(
                staffList.filter((staff) =>
                  staff.name.toLowerCase().includes(search.toLowerCase())
                ).length / recordsPerPage
              )
            }
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            다음
          </button>
        </div>
      </div>

      {/* 승인 대기 목록 */}
      <StaffApprovalList onApprove={handleApprove} />
    </div>
  );
}
