"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

interface ReservationStatusProps {
  onDateSelect?: (date: string, reservations: Reservation[]) => void;
  showCreateButton?: boolean;
  isAdminView?: boolean;
  initialDate?: string; // 초기 선택 날짜 (선택적)
}

export default function ReservationStatus({
  onDateSelect,
  showCreateButton = true,
  isAdminView = false,
  initialDate,
}: ReservationStatusProps) {
  const { user } = useUser();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<
    Reservation[]
  >([]);
  const [allUserReservations, setAllUserReservations] = useState<Reservation[]>(
    []
  ); // 유저 전체 예약 (달력 점 표시용)
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  // 유저 역할 확인
  const isAdminOrStaff =
    user && (user.userRole === "ROLE_ADMIN" || user.userRole === "ROLE_STAFF");

  // 현재 날짜를 YYYY-MM-DD 형식으로 반환하는 함수 추가
  const getFormattedDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 초기 데이터 로드 및 날짜 설정
  useEffect(() => {
    // initialDate가 있으면 해당 날짜를, 없으면 오늘 날짜를 사용
    const today = getFormattedDate(new Date());
    console.log("=== 날짜 설정 디버깅 ===");
    console.log("초기 today:", today);
    console.log("initialDate:", initialDate);
    console.log("currentDate:", currentDate);
    console.log("selectedDate:", selectedDate);

    setSelectedDate(today);

    // 일반 유저인 경우 전체 예약 미리 로드
    if (!isAdminView && !isAdminOrStaff && user) {
      fetchAllUserReservations();
    }
    // 관리자/의료진인 경우 월별 예약 정보 로드
    else if ((isAdminView || isAdminOrStaff) && user) {
      fetchMonthlyReservations();
    }

    handleDateSelect(today);
  }, [user]);

  useEffect(() => {
    if ((isAdminView || isAdminOrStaff) && user) {
      fetchMonthlyReservations();
    }
  }, [currentDate, isAdminView, isAdminOrStaff, user]);

  // 👇 ✨ 새로 추가: initialDate 처리를 위한 별도 useEffect
  useEffect(() => {
    // initialDate가 있을 때만 실행되는 완전 독립적인 로직
    if (!initialDate) return;

    // 잠시 대기 후 실행 (기존 로직과 충돌 방지)
    const timer = setTimeout(() => {
      if (user) {
        // 조건 체크만 하고 의존성에는 포함하지 않음
        const dateObj = new Date(initialDate);
        setCurrentDate(dateObj);
        setSelectedDate(initialDate);
        handleDateSelect(initialDate);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [initialDate]); // initialDate만 의존성으로

  // 기존 useEffect들은 그대로 두고, 맨 아래에 이것만 추가
  useEffect(() => {
    if (initialDate && user) {
      // 페이지 로드 완료 후 실행
      const timer = setTimeout(() => {
        const dateObj = new Date(initialDate);
        setCurrentDate(dateObj);
        setSelectedDate(initialDate);

        // 강제로 데이터 다시 로드
        if (isAdminView || isAdminOrStaff) {
          fetchMonthlyReservations();
        } else {
          fetchAllUserReservations();
        }

        // 날짜 선택 처리
        fetchReservationsByDate(initialDate);
      }, 1000); // 1초 지연

      return () => clearTimeout(timer);
    }
  }, [initialDate]);

  // 유저의 전체 예약 조회
  const fetchAllUserReservations = async () => {
    if (!user || isAdminView || isAdminOrStaff) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reservations/user/${user.id}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAllUserReservations(data);
      }
    } catch (error) {
      console.error("유저 예약 정보 로드 오류:", error);
    }
  };

  const fetchMonthlyReservations = async () => {
    if (!user || (!isAdminView && !isAdminOrStaff)) return;

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reservations/calendar?year=${year}&month=${month}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        // 예약이 있는 날짜들만 추출
        const reservationDates = data.days
          .filter((day: any) => day.hasReservation)
          .map((day: any) => day.date);

        // 날짜 정보만 저장 (달력 표시용)
        const mockReservations = reservationDates.map((date: string) => ({
          reservationDate: date,
        }));
        setAllUserReservations(mockReservations);
      }
    } catch (error) {
      console.error("월별 예약 정보 로드 오류:", error);
    }
  };

  // 날짜별 예약 조회
  const fetchReservationsByDate = async (date: string) => {
    if (!user) return;

    try {
      setLoading(true);
      let response;

      // 관리자/의료진인 경우 모든 예약 조회
      if (isAdminView || isAdminOrStaff) {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reservations/date/${date}`,
          {
            credentials: "include",
          }
        );
      } else {
        // 일반 유저인 경우 본인 예약만 조회
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reservations/user/${user.id}`,
          {
            credentials: "include",
          }
        );
      }

      if (!response.ok) {
        throw new Error("예약 정보를 불러오는데 실패했습니다.");
      }

      let data = await response.json();

      // 일반 유저인 경우 선택된 날짜로 필터링
      if (!isAdminView && !isAdminOrStaff) {
        data = data.filter(
          (reservation: Reservation) => reservation.reservationDate === date
        );
      }

      setReservations(data);
      setFilteredReservations(data);

      // 부모 컴포넌트에 선택된 날짜와 예약 정보 전달
      if (onDateSelect) {
        onDateSelect(date, data);
      }
    } catch (error) {
      console.error("예약 정보 로드 오류:", error);
      setReservations([]);
      setFilteredReservations([]);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (date: string) => {
    console.log("=== 날짜 선택 디버깅 ===");
    console.log("선택된 날짜:", date);
    console.log("이전 선택 날짜:", selectedDate);

    setSelectedDate(date);
    fetchReservationsByDate(date);
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
      const isSelected = selectedDate === dateStr;
      const isToday = dateStr === getFormattedDate(new Date()); // getFormattedDate 함수 사용

      // 해당 날짜에 예약이 있는지 확인
      let hasReservation = false;
      if (!isAdminView && !isAdminOrStaff) {
        // 일반 유저: 본인 예약만 확인
        hasReservation = allUserReservations.some(
          (r) => r.reservationDate === dateStr
        );
      } else {
        // 관리자/의료진: 모든 예약 확인
        hasReservation = allUserReservations.some(
          (r) => r.reservationDate === dateStr
        );
      }

      days.push({
        day,
        dateStr,
        isSelected,
        isToday,
        hasReservation,
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

  const calendarDays = generateCalendar();

  return (
    <div className="bg-white relative">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 px-6 pt-6">
        <h2 className="text-xl font-semibold">예약 현황</h2>
        {showCreateButton && (
          <Link
            href="/reservation"
            className="bg-[#49BEB7] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#3ea9a2] transition-colors duration-200"
          >
            예약 등록
          </Link>
        )}
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
                              dayInfo.isSelected ? "bg-white" : "bg-[#49BEB7]"
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
                      <div key={time} className="flex items-center py-2.5 h-10">
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
                          <div className="text-sm text-gray-400 py-1">-</div>
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
                      <div key={time} className="flex items-center py-2.5 h-10">
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
                          <div className="text-sm text-gray-400 py-1">-</div>
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
  );
}
