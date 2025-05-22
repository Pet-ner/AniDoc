"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  FileText,
  Check,
  X,
  RefreshCw,
  User,
  Eye,
} from "lucide-react";

// 예약 타입
interface Reservation {
  id: number;
  userId: number;
  userName: string;
  petId: number;
  petName: string;
  doctorId?: number;
  doctorName?: string;
  reservationDate: string;
  reservationTime: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  symptom: string;
  type: "GENERAL" | "VACCINATION";
  createdAt: string;
  updatedAt: string;
}

// 의사 타입
interface Doctor {
  id: number;
  name: string;
  status: "ON_DUTY" | "ON_LEAVE";
}

export default function ReservationManagement() {
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<
    Reservation[]
  >([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    dateParam ? new Date(dateParam).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [assigningDoctor, setAssigningDoctor] = useState<{
    reservationId: number;
    doctorId: number | null;
  } | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 관리자만 접근 가능하도록
  //   useEffect(() => {
  //     if (user && user.role !== "ROLE_ADMIN" && user.role !== "ROLE_STAFF") {
  //       router.push("/");
  //     }
  //   }, [user, router]);

  // 초기 날짜 설정
  useEffect(() => {
    const today = formatDate(new Date());
    setSelectedDate(today);
  }, []);

  // URL 변경 감지하여 selectedDate 업데이트
  useEffect(() => {
    if (dateParam) {
      setSelectedDate(new Date(dateParam).toISOString().split("T")[0]);
    }
  }, [dateParam]);

  // 예약 목록 조회
  useEffect(() => {
    if (!user || !selectedDate) return;

    const fetchReservations = async () => {
      try {
        setLoading(true);

        // 날짜별 예약 목록 조회 API 호출
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reservations/date/${selectedDate}`,
          {
            credentials: "include",
          }
        );
        if (!response.ok)
          throw new Error("예약 정보를 불러오는데 실패했습니다.");
        const data = await response.json();

        setReservations(data);
        setFilteredReservations(data);
      } catch (error) {
        console.error("예약 정보 로드 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [selectedDate, user]);

  // 의사 목록 조회
  useEffect(() => {
    if (!user) return;

    const fetchDoctors = async () => {
      try {
        // 의사 조회 API (ON_DUTY 상태인 의사만 조회)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/staff?onlyAvailable=true`,
          {
            credentials: "include",
          }
        );
        if (!response.ok)
          throw new Error("의사 정보를 불러오는데 실패했습니다.");
        const data = await response.json();

        setDoctors(data);
      } catch (error) {
        console.error("의사 정보 로드 오류:", error);
        // 에러 발생 시 빈 배열로 초기화
        setDoctors([]);
      }
    };

    fetchDoctors();
  }, [user]);

  // 필터링 적용
  useEffect(() => {
    if (reservations.length === 0) return;

    let filtered = [...reservations];

    // 상태 필터 적용
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // 검색어 필터 적용
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.userName.toLowerCase().includes(term) ||
          r.petName.toLowerCase().includes(term) ||
          r.symptom.toLowerCase().includes(term)
      );
    }

    setFilteredReservations(filtered);
    setCurrentPage(1); // 필터 변경시 첫 페이지로 이동
  }, [statusFilter, searchTerm, reservations]);

  // 의사 배정 처리
  const handleAssignDoctor = async () => {
    if (!assigningDoctor || !assigningDoctor.doctorId) return;

    try {
      setLoading(true);

      const requestData = {
        doctorId: assigningDoctor.doctorId,
      };

      // 의사 배정 API 호출
      console.log("의사 배정 데이터:", requestData);
      const response = await fetch(
        // @ts-ignore
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reservations/${assigningDoctor.reservationId}/doctor?userId=${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "의사 배정에 실패했습니다.");
      }

      const updatedReservation = await response.json();

      const updatedReservations = reservations.map((r) => {
        if (r.id === updatedReservation.id) {
          return updatedReservation;
        }
        return r;
      });

      // @ts-ignore
      setReservations(updatedReservations);

      // 필터링 다시 적용
      let filtered = [...updatedReservations];
      if (statusFilter !== "ALL") {
        filtered = filtered.filter((r) => r.status === statusFilter);
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.userName.toLowerCase().includes(term) ||
            r.petName.toLowerCase().includes(term) ||
            r.symptom.toLowerCase().includes(term)
        );
      }
      // @ts-ignore
      setFilteredReservations(filtered);

      setAssigningDoctor(null);
    } catch (error: any) {
      console.error("의사 배정 오류:", error);
      alert(error.message || "담당의 배정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 예약 상태 변경 처리
  const handleUpdateStatus = async (
    reservationId: number,
    newStatus: string
  ) => {
    try {
      setLoading(true);

      const requestData = {
        status: newStatus,
      };
      console.log("상태 변경 데이터:", requestData);

      // 상태 변경 API 호출
      const response = await fetch(
        // @ts-ignore
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reservations/${reservationId}/status?userId=${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "상태 변경에 실패했습니다.");
      }

      const updatedReservation = await response.json();

      const updatedReservations = reservations.map((r) => {
        if (r.id === updatedReservation.id) {
          return updatedReservation;
        }
        return r;
      });

      setReservations(updatedReservations);

      // 필터링 다시 적용
      let filtered = [...updatedReservations];
      if (statusFilter !== "ALL") {
        filtered = filtered.filter((r) => r.status === statusFilter);
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.userName.toLowerCase().includes(term) ||
            r.petName.toLowerCase().includes(term) ||
            r.symptom.toLowerCase().includes(term)
        );
      }
      setFilteredReservations(filtered);
    } catch (error: any) {
      console.error("상태 변경 오류:", error);
      alert(error.message || "상태 변경 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 페이지네이션 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  // 이전 날짜로 이동
  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(formatDate(date));
  };

  // 다음 날짜로 이동
  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(formatDate(date));
  };

  // 오늘 날짜로 이동
  const goToToday = () => {
    setSelectedDate(formatDate(new Date()));
  };

  // 예약 상세 모달 표시
  const openReservationDetail = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  // 한글 요일 표시
  const getDayOfWeek = (dateStr: string) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">예약 관리</h1>

        <div className="flex items-center space-x-3">
          <button
            onClick={goToPreviousDay}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>

          <button
            onClick={goToToday}
            className="px-3 py-1 bg-teal-50 border border-teal-200 rounded-md text-sm text-teal-600 hover:bg-teal-100"
          >
            오늘
          </button>

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* 필터 및 검색 바 */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center">
          <Calendar size={20} className="text-teal-500 mr-2" />
          <h2 className="font-medium">
            {selectedDate} ({getDayOfWeek(selectedDate)}) 예약 현황
          </h2>
        </div>

        <div className="flex gap-4 flex-grow-0">
          <div className="flex items-center">
            <Filter size={18} className="text-gray-400 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
            >
              <option value="ALL">모든 상태</option>
              <option value="PENDING">대기중</option>
              <option value="APPROVED">승인됨</option>
              <option value="REJECTED">거절됨</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="이름, 증상 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm w-64"
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* 예약 목록 테이블 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  시간
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  보호자/반려동물
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  진료 유형
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  상태
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  담당의
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw
                        size={20}
                        className="text-teal-500 animate-spin mr-2"
                      />
                      <span>로딩 중...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    예약 정보가 없습니다.
                  </td>
                </tr>
              ) : (
                currentItems.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {reservation.reservationTime.substring(0, 5)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        <div className="ml-1">
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.petName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {reservation.type === "GENERAL" ? "일반진료" : "예방접종"}
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {reservation.doctorName ? (
                        reservation.doctorName
                      ) : (
                        <button
                          onClick={() =>
                            setAssigningDoctor({
                              reservationId: reservation.id,
                              doctorId: null,
                            })
                          }
                          className="text-teal-600 hover:text-teal-800 hover:underline"
                        >
                          배정하기
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => openReservationDetail(reservation)}
                          className="text-gray-500 hover:text-teal-600"
                          title="상세보기"
                        >
                          <Eye size={18} />
                        </button>

                        {reservation.status === "PENDING" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(reservation.id, "APPROVED")
                              }
                              className="text-green-500 hover:text-green-700"
                              title="승인"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(reservation.id, "REJECTED")
                              }
                              className="text-red-500 hover:text-red-700"
                              title="거절"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {filteredReservations.length > itemsPerPage && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  전체{" "}
                  <span className="font-medium">
                    {filteredReservations.length}
                  </span>
                  개 중{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span>-
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredReservations.length)}
                  </span>
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <span className="sr-only">이전</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          page === currentPage
                            ? "z-10 bg-teal-50 border-teal-500 text-teal-600"
                            : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                        } text-sm font-medium`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <span className="sr-only">다음</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 의사 배정 모달 */}
      {assigningDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="text-teal-500 mr-2" size={20} />
              담당 의료진 배정
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                의료진 선택
              </label>
              <select
                value={assigningDoctor.doctorId || ""}
                onChange={(e) =>
                  setAssigningDoctor({
                    ...assigningDoctor,
                    doctorId: parseInt(e.target.value) || null,
                  })
                }
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
              >
                <option value="">의료진 선택</option>
                {doctors
                  .filter((d) => d.status === "ON_DUTY")
                  .map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                * 진료 가능한 의료진만 표시됩니다.
              </p>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={handleAssignDoctor}
                disabled={!assigningDoctor.doctorId}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                배정하기
              </button>
              <button
                onClick={() => setAssigningDoctor(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 예약 상세 모달 */}
      {showModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="text-teal-500 mr-2" size={20} />
                예약 상세 정보
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedReservation(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">예약 ID</h4>
                  <p className="mt-1">{selectedReservation.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    예약 상태
                  </h4>
                  <p className="mt-1">
                    <span
                      className={`inline-flex text-xs px-2 py-1 rounded-full ${
                        selectedReservation.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : selectedReservation.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedReservation.status === "APPROVED"
                        ? "진료 확정"
                        : selectedReservation.status === "PENDING"
                        ? "대기중"
                        : "거절됨"}
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    보호자 정보
                  </h4>
                  <p className="mt-1">
                    {selectedReservation.userName} (ID:{" "}
                    {selectedReservation.userId})
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    반려동물 정보
                  </h4>
                  <p className="mt-1">
                    {selectedReservation.petName} (ID:{" "}
                    {selectedReservation.petId})
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    예약 일시
                  </h4>
                  <p className="mt-1">
                    {selectedReservation.reservationDate}{" "}
                    {selectedReservation.reservationTime}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    진료 유형
                  </h4>
                  <p className="mt-1">
                    {selectedReservation.type === "GENERAL"
                      ? "일반진료"
                      : "예방접종"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    담당 의료진
                  </h4>
                  <p className="mt-1">
                    {selectedReservation.doctorName || "미배정"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    예약 생성 시간
                  </h4>
                  <p className="mt-1">{selectedReservation.createdAt}</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500">
                  증상 및 참고사항
                </h4>
                <div className="mt-1 bg-gray-50 p-3 rounded-md">
                  <p className="whitespace-pre-line">
                    {selectedReservation.symptom || "정보 없음"}
                  </p>
                </div>
              </div>

              {/* 관리 버튼 */}
              <div className="mt-6 flex justify-end space-x-3">
                {!selectedReservation.doctorId && (
                  <button
                    onClick={() => {
                      setAssigningDoctor({
                        reservationId: selectedReservation.id,
                        doctorId: null,
                      });
                      setShowModal(false);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-teal-500 hover:bg-teal-600"
                  >
                    담당의 배정
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedReservation(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
