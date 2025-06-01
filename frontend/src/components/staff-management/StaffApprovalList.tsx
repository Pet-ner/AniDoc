import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";

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

interface StaffApprovalListProps {
  onApprove: (staff: PendingStaff) => void;
}

export default function StaffApprovalList({
  onApprove,
}: StaffApprovalListProps) {
  const { user } = useUser();
  const [pendingStaffList, setPendingStaffList] = useState<PendingStaff[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const recordsPerPage = 4;

  useEffect(() => {
    if (user?.userRole === "ROLE_ADMIN") {
      fetchPendingStaff();
    }
  }, [user]);

  const fetchPendingStaff = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admins/pending-approvals`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("승인 대기 목록을 불러오는데 실패했습니다.");
      }
      const data = await response.json();
      setPendingStaffList(data);
    } catch (error) {
      console.error("Error fetching pending staff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admins/approve/${id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("직원 승인에 실패했습니다.");
      }

      const staffToApprove = pendingStaffList.find((staff) => staff.id === id);
      if (staffToApprove) {
        onApprove(staffToApprove);
        setPendingStaffList((prev) => prev.filter((staff) => staff.id !== id));
      }
    } catch (error) {
      console.error("Error approving staff:", error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admins/reject/${id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("직원 승인 거절에 실패했습니다.");
      }

      setPendingStaffList((prev) => prev.filter((staff) => staff.id !== id));
    } catch (error) {
      console.error("Error rejecting staff:", error);
    }
  };

  const totalPages = Math.ceil(pendingStaffList.length / recordsPerPage);
  const currentStaff = pendingStaffList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  if (isLoading) {
    return (
      <div className="w-96 bg-white rounded-lg shadow-sm p-4">
        <div className="text-center text-gray-500 py-4">로딩 중...</div>
      </div>
    );
  }

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
