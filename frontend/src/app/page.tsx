"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Dog,
  Stethoscope,
  ClipboardPlus,
  Trash2,
} from "lucide-react";
// RecentNotifications 삭제하고 RecentReservations만 import
import RecentReservations from "@/components/RecentReservations";
import RecentNotices from "@/components/RecentNotices";

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

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<
    Reservation[]
  >([]);
  const [loading, setLoading] = useState(true);

  // 달력 관련 상태
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  // 모든 예약 시간 슬롯
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

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
        // 오늘 날짜로 초기 필터링
        const today = new Date().toISOString().split("T")[0];
        setSelectedDate(today);
        setFilteredReservations(
          data.filter((r: Reservation) => r.reservationDate === today)
        );
      } catch (error) {
        console.error("예약 정보 로드 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReservations();
    }
  }, [user]);

  // 날짜 선택시 예약 필터링
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    const filtered = reservations.filter((r) => r.reservationDate === date);
    setFilteredReservations(filtered);
  };

  // 달력 생성 함수
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // 이전 달의 빈 칸들
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const hasReservation = reservations.some(
        (r) => r.reservationDate === dateStr
      );
      const isSelected = selectedDate === dateStr;
      const isToday = dateStr === new Date().toISOString().split("T")[0];

      days.push({
        day,
        dateStr,
        hasReservation,
        isSelected,
        isToday,
      });
    }

    return days;
  };

  // 달 변경 함수
  const changeMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // 선택된 날짜 포맷팅
  const formatSelectedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];

    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };

  // 시간별 예약 찾기
  const getReservationByTime = (time: string) => {
    return filteredReservations.find(
      (r) => r.reservationTime.substring(0, 5) === time
    );
  };

  // 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

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

  const closeCancelModal = () => {
    setCancelConfirmOpen(false);
    setCancelingId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const calendarDays = generateCalendar();

  return (
    <div className="p-8">
      {/* 상단 통계 카드 섹션 */}
      <div className="grid grid-cols-4 gap-6 mb-6">
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

      {/* 예약 현황과 알림/공지사항 그리드 */}
      <div className="grid grid-cols-4 gap-6">
        {/* 예약 현황 섹션 */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow-sm relative">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 px-6 pt-6">
              <h2 className="text-xl font-semibold">예약 현황</h2>
              <Link
                href="/reservation"
                className="bg-[#49BEB7] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#3ea9a2] transition-colors duration-200"
              >
                예약 등록
              </Link>
            </div>

            <div className="px-6 pb-6">
              <div className="grid grid-cols-10 gap-8 relative">
                {/* 달력 섹션 */}
                <div className="col-span-3 pr-6">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => changeMonth("prev")}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronLeft size={16} className="text-gray-600" />
                      </button>
                      <h3 className="text-sm font-medium text-center flex-1">
                        {currentDate.toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                        })}
                      </h3>
                      <button
                        onClick={() => changeMonth("next")}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronRight size={16} className="text-gray-600" />
                      </button>
                    </div>

                    {/* 요일 헤더 */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-medium text-gray-500 py-1"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* 달력 날짜 */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((dayInfo, index) => (
                        <div key={index} className="aspect-square">
                          {dayInfo ? (
                            <button
                              onClick={() => handleDateSelect(dayInfo.dateStr)}
                              className={`w-full h-full flex items-center justify-center text-xs relative rounded transition-colors ${
                                dayInfo.isSelected
                                  ? "bg-[#49BEB7] text-white"
                                  : dayInfo.isToday
                                  ? "bg-blue-100 text-blue-800"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              {dayInfo.day}
                              {dayInfo.hasReservation && (
                                <div
                                  className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                                    dayInfo.isSelected
                                      ? "bg-white"
                                      : "bg-[#49BEB7]"
                                  }`}
                                />
                              )}
                            </button>
                          ) : (
                            <div />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 세로 구분선 */}
                <div className="absolute left-[30%] -top-6 -bottom-6 w-px bg-gray-200" />

                {/* 선택된 날짜의 예약 목록 */}
                <div className="col-span-7 pl-6">
                  <div className="mb-4">
                    <h3 className="text-base font-medium mb-2">
                      {selectedDate
                        ? formatSelectedDate(selectedDate)
                        : "날짜를 선택해주세요"}
                    </h3>
                  </div>

                  {selectedDate && (
                    <div className="grid grid-cols-2 gap-x-8 h-80">
                      {/* 왼쪽 8개 시간 슬롯 */}
                      <div className="space-y-0">
                        {timeSlots.slice(0, 8).map((time) => {
                          const reservation = getReservationByTime(time);
                          return (
                            <div
                              key={time}
                              className="flex items-center py-2.5 h-10"
                            >
                              <div className="w-12 text-sm text-gray-600 mr-3 flex-shrink-0">
                                {time}
                              </div>
                              {reservation ? (
                                <Link
                                  href={`/reservation/${reservation.id}`}
                                  className="flex items-center space-x-2 flex-1 min-w-0 hover:bg-gray-50 rounded px-2 py-1 cursor-pointer transition-colors"
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(
                                      reservation.status
                                    )}`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-gray-900 truncate">
                                      <span className="font-medium">
                                        {reservation.userName}
                                      </span>
                                      <span className="text-gray-500 ml-2">
                                        {reservation.petName} /{" "}
                                        {reservation.type === "GENERAL"
                                          ? "일반진료"
                                          : "예방접종"}
                                        {reservation.doctorName &&
                                          ` / ${reservation.doctorName}`}
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              ) : (
                                <div className="text-sm text-gray-400 py-1">
                                  -
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* 오른쪽 8개 시간 슬롯 */}
                      <div className="space-y-0">
                        {timeSlots.slice(8, 16).map((time) => {
                          const reservation = getReservationByTime(time);
                          return (
                            <div
                              key={time}
                              className="flex items-center py-2.5 h-10"
                            >
                              <div className="w-12 text-sm text-gray-600 mr-3 flex-shrink-0">
                                {time}
                              </div>
                              {reservation ? (
                                <Link
                                  href={`/reservation/${reservation.id}`}
                                  className="flex items-center space-x-2 flex-1 min-w-0 hover:bg-gray-50 rounded px-2 py-1 cursor-pointer transition-colors"
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(
                                      reservation.status
                                    )}`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-gray-900 truncate">
                                      <span className="font-medium">
                                        {reservation.userName}
                                      </span>
                                      <span className="text-gray-500 ml-2">
                                        {reservation.petName} /{" "}
                                        {reservation.type === "GENERAL"
                                          ? "일반진료"
                                          : "예방접종"}
                                        {reservation.doctorName &&
                                          ` / ${reservation.doctorName}`}
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              ) : (
                                <div className="text-sm text-gray-400 py-1">
                                  -
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 알림 및 공지사항 섹션 */}
        <div className="col-span-1 space-y-6">
          <div className="relative">
            <RecentReservations />
          </div>
          <div className="relative">
            <RecentNotices />
          </div>
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
