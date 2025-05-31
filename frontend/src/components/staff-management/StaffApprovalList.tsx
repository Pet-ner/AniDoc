import { useState } from "react";

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
  {
    id: 4,
    name: "이신입",
    email: "new.lee@anidoc.com",
    phoneNumber: "010-8888-7777",
    emergencyContact: "010-2222-3333",
    role: "ROLE_STAFF",
    requestDate: "2024-03-18",
  },
  {
    id: 5,
    name: "박신입",
    email: "new.park@anidoc.com",
    phoneNumber: "010-7777-6666",
    emergencyContact: "010-3333-4444",
    role: "ROLE_STAFF",
    requestDate: "2024-03-19",
  },
  {
    id: 6,
    name: "최신입",
    email: "new.choi@anidoc.com",
    phoneNumber: "010-6666-5555",
    emergencyContact: "010-4444-5555",
    role: "ROLE_STAFF",
    requestDate: "2024-03-20",
  },
  {
    id: 7,
    name: "정신입",
    email: "new.jung@anidoc.com",
    phoneNumber: "010-5555-4444",
    emergencyContact: "010-5555-6666",
    role: "ROLE_STAFF",
    requestDate: "2024-03-21",
  },
  {
    id: 8,
    name: "강신입",
    email: "new.kang@anidoc.com",
    phoneNumber: "010-4444-3333",
    emergencyContact: "010-6666-7777",
    role: "ROLE_STAFF",
    requestDate: "2024-03-22",
  },
  {
    id: 9,
    name: "윤신입",
    email: "new.yoon@anidoc.com",
    phoneNumber: "010-3333-2222",
    emergencyContact: "010-7777-8888",
    role: "ROLE_STAFF",
    requestDate: "2024-03-23",
  },
];

interface StaffApprovalListProps {
  onApprove: (staff: PendingStaff) => void;
}

export default function StaffApprovalList({
  onApprove,
}: StaffApprovalListProps) {
  const [pendingStaffList, setPendingStaffList] =
    useState<PendingStaff[]>(mockPendingStaffData);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;

  const handleApprove = (id: number) => {
    const staffToApprove = pendingStaffList.find((staff) => staff.id === id);
    if (staffToApprove) {
      onApprove(staffToApprove);
      setPendingStaffList((prev) => prev.filter((staff) => staff.id !== id));
    }
  };

  const handleReject = (id: number) => {
    setPendingStaffList((prev) => prev.filter((staff) => staff.id !== id));
  };

  const totalPages = Math.ceil(pendingStaffList.length / recordsPerPage);
  const currentStaff = pendingStaffList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="w-96 bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">승인 대기 목록</h2>
      <div className="space-y-4">
        {currentStaff.map((staff) => (
          <div key={staff.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium text-[#49BEB7]">{staff.name}</div>
                <div className="text-sm text-gray-500">{staff.email}</div>
              </div>
              <div className="text-xs text-gray-500">{staff.requestDate}</div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleApprove(staff.id)}
                className="flex-1 px-3 py-1 bg-[#49BEB7] text-white rounded-md hover:bg-[#3da8a1] text-sm"
              >
                승인
              </button>
              <button
                onClick={() => handleReject(staff.id)}
                className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                거절
              </button>
            </div>
          </div>
        ))}
        {pendingStaffList.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            승인 대기 중인 직원이 없습니다.
          </div>
        )}
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
              )
            )}
          </div>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
