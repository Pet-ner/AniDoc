"use client";

import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useState, useEffect } from "react";
import {
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Dog,
  Stethoscope,
  ClipboardPlus,
  Trash2,
  SquarePen,
} from "lucide-react";

interface Reservation {
  id: number;
  userId: number;
  userName: string;
  petId: number;
  petName: string;
  reservationDate: string;
  reservationTime: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  symptom: string;
  type: "GENERAL" | "VACCINATION";
  doctorName: string;
  createdAt: string;
  updatedAt: string;
}

interface Notice {
  id: number;
  title: string;
  createdAt: string;
}

export default function Home() {
  const { user } = useUser();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<
    Array<{
      id: number;
      title: string;
      read: boolean;
    }>
  >([
    { id: 1, title: "예방접종 일정이 다가옵니다.", read: false },
    { id: 2, title: "진료예약 5/22 오후 2시 확정되었습니다.", read: false },
    { id: 3, title: "진료예약이 5/25로 변경되었습니다.", read: true },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  // 예약 데이터 조회
  useEffect(() => {
    if (!user) return;

    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reservations/user/${user.id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("예약 정보를 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setReservations(data);
        setTotalPages(Math.ceil(data.length / 10));
      } catch (error) {
        console.error("예약 정보 로드 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    // 공지사항 데이터 조회
    const fetchNotices = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notices?page=0&size=4`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("공지사항을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setNotices(data.content); // content 배열에서 공지사항 데이터 추출
      } catch (error) {
        console.error("공지사항 로드 오류:", error);
      }
    };

    // 예약은 로그인한 사용자만, 공지사항은 모든 사용자가 볼 수 있음
    if (user) {
      fetchReservations();
    }
    fetchNotices();
  }, [user]);

  if (!user) return null;

  const handleCancel = (id: number) => {
    setCancelingId(id);
    setCancelConfirmOpen(true);
  };

  const confirmCancel = async () => {
    if (!cancelingId || !user) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reservations/${cancelingId}?userId=${user.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "예약 취소에 실패했습니다.");
      }
      // 취소된 예약 제거
      const updatedReservations = reservations.filter(
        (r) => r.id !== cancelingId
      );
      setReservations(updatedReservations);
      alert("예약이 성공적으로 취소되었습니다.");
    } catch (error: any) {
      console.error("예약 취소 오류:", error);
      alert(error.message || "예약 취소 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setCancelConfirmOpen(false);
      setCancelingId(null);
    }
  };

  // 취소 모달 닫기
  const closeCancelModal = () => {
    setCancelConfirmOpen(false);
    setCancelingId(null);
  };

  return (
    <div className="space-y-6">
      {/* 상단 통계 카드 섹션 */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="예정된 예약"
          value="2"
          icon={<Calendar size={20} className="text-teal-500" />}
          bgColor="bg-teal-50"
        />
        <StatCard
          title="반려동물"
          value="5"
          icon={<Dog size={20} className="text-blue-500" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="최근 진료"
          value="10"
          icon={<Stethoscope size={20} className="text-purple-500" />}
          bgColor="bg-purple-50"
        />
        <StatCard
          title="진료 내역"
          value="2"
          icon={<ClipboardPlus size={20} className="text-amber-500" />}
          bgColor="bg-amber-50"
        />
      </div>

      {/* 예약 현황 */}
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">예약 현황</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="환자 검색"
                    className="pr-8 pl-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                        stroke="#9CA3AF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <Link
                  href="/reservation"
                  title="예약등록"
                  className="bg-[#49BEB7] text-white px-3 py-1 rounded-md text-sm hover:bg-[#3ea9a2] transition-colors duration-200"
                >
                  예약 등록
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      시간
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      보호자
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      반려동물
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      진료 유형
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      담당의
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      상태
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-4 text-center text-gray-500"
                      >
                        로딩 중...
                      </td>
                    </tr>
                  ) : reservations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-4 text-center text-gray-500"
                      >
                        예약 정보가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    reservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {reservation.reservationTime.substring(0, 5)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {reservation.userName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {reservation.petName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {reservation.type === "GENERAL"
                            ? "일반진료"
                            : "예방접종"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {reservation.doctorName || "미배정"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex text-xs px-2 py-1 rounded-full ${
                              reservation.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : reservation.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {reservation.status === "APPROVED"
                              ? "진료 확정"
                              : reservation.status === "PENDING"
                              ? "대기중"
                              : "거절됨"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="flex justify-center space-x-2">
                            <Link
                              href={`/reservation/${reservation.id}`}
                              className="text-gray-500 hover:text-[#49BEB7]"
                              title="상세보기"
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              href={`/reservation/edit/${reservation.id}`}
                              className="text-gray-500 hover:text-[#49BEB7]"
                              title="수정하기"
                            >
                              <SquarePen size={18} />
                            </Link>
                            <button
                              onClick={() => handleCancel(reservation.id)}
                              className="text-gray-500 hover:text-[#49BEB7]"
                              title="취소하기"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center mt-5">
              <nav className="flex items-center">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-1 rounded-md mr-2 text-gray-500 disabled:text-gray-300"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                          currentPage === page
                            ? "bg-[#49BEB7] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-md ml-2 text-gray-500 disabled:text-gray-300"
                >
                  <ChevronRight size={20} />
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* 알림 및 공지사항 */}
        <div className="col-span-1 space-y-6">
          {/* 최근 알림 */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">최근 알림</h2>
            </div>
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start p-2 rounded-md hover:bg-gray-50"
                >
                  {!notification.read && (
                    <div className="mt-1.5 mr-2 w-2 h-2 bg-[#49BEB7] rounded-full flex-shrink-0"></div>
                  )}
                  <div
                    className={
                      notification.read ? "pl-4 text-gray-500" : "text-gray-800"
                    }
                  >
                    {notification.title}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <button className="text-sm text-[#49BEB7] hover:underline">
                모든 알림 보기
              </button>
            </div>
          </div>

          {/* 공지사항 */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">공지사항</h2>
            </div>
            <div className="space-y-3">
              {Array.isArray(notices) && notices.length > 0 ? (
                notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="border-b border-gray-100 pb-2 last:border-0"
                  >
                    <Link
                      href={`/notices/${notice.id}`}
                      className="block py-1 hover:text-[#49BEB7]"
                    >
                      <p className="text-sm">{notice.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notice.createdAt).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }
                        )}
                      </p>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  공지사항이 없습니다.
                </div>
              )}
            </div>
            <div className="mt-3 text-center">
              <Link
                href="/notices"
                className="text-sm text-[#49BEB7] hover:underline"
              >
                모든 공지사항 보기
              </Link>
            </div>
          </div>

          {/* 예약 취소 확인 모달 */}
          {cancelConfirmOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold mb-4">예약 취소 확인</h3>
                <p className="mb-6 text-gray-600">
                  정말로 이 예약을 취소하시겠습니까?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={confirmCancel}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600"
                  >
                    예
                  </button>
                  <button
                    onClick={closeCancelModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    아니오
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
}

function StatCard({ title, value, icon, bgColor }: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-lg shadow-sm p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
