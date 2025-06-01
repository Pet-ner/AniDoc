"use client";

import { useUser } from "@/contexts/UserContext";
import {
  Calendar,
  Dog,
  Stethoscope,
  ClipboardPlus,
  Clock,
  CalendarCheck,
} from "lucide-react";
import ReservationStatus from "@/components/ReservationStatus";
import RecentReservations from "@/components/RecentReservations";
import RecentNotices from "@/components/RecentNotices";
import { useState, useEffect } from "react";

interface UserStatsType {
  todayReservations: number;
  upcomingReservations: number;
  pendingReservations: number;
  totalPets: number;
  totalTreatments: number;
  lastVisitDate: string | null;
}

interface StaffStatsType {
  todayMyReservations: number;
  myTreatedPets: number;
  pendingReservations: number;
  weeklyMyTreatments: number;
  weeklyVaccinations?: number;
}

interface AdminStatsType {
  todayTotalReservations: number;
  totalPets: number;
  pendingReservations: number;
  weeklyCompletedTreatments: number;
  recentVaccinations?: number;
}

export default function Home() {
  const { user } = useUser();
  const [userStats, setUserStats] = useState<UserStatsType>({
    todayReservations: 0,
    upcomingReservations: 0,
    pendingReservations: 0,
    totalPets: 0,
    totalTreatments: 0,
    lastVisitDate: null,
  });
  const [staffStats, setStaffStats] = useState<StaffStatsType>({
    todayMyReservations: 0,
    myTreatedPets: 0,
    pendingReservations: 0,
    weeklyMyTreatments: 0,
    weeklyVaccinations: 0,
  });
  const [adminStats, setAdminStats] = useState<AdminStatsType>({
    todayTotalReservations: 0,
    totalPets: 0,
    pendingReservations: 0,
    weeklyCompletedTreatments: 0,
    recentVaccinations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 보호자 통계 데이터 가져오기
  const fetchUserStats = async () => {
    if (!user || user.userRole !== "ROLE_USER") {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/statistics/users/${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      } else {
        handleApiError(response);
      }
    } catch (error) {
      // 에러 처리는 유지 (운영에서 필요)
    }
  };

  // 의료진 통계 데이터 가져오기
  const fetchStaffStats = async () => {
    if (!user || user.userRole !== "ROLE_STAFF") {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/statistics/staff/dashboard`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStaffStats(data);
      } else {
        handleApiError(response);
      }
    } catch (error) {
      // 에러 처리는 유지
    }
  };

  // 관리자 통계 데이터 가져오기
  const fetchAdminStats = async () => {
    if (!user || user.userRole !== "ROLE_ADMIN") {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/statistics/admin/dashboard`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAdminStats(data);
      } else {
        handleApiError(response);
      }
    } catch (error) {
      // 에러 처리는 유지
    }
  };

  // API 에러 처리 함수
  const handleApiError = async (response: Response) => {
    try {
      await response.text();
    } catch (textError) {
      // 에러 처리
    }
  };

  // 통계 데이터 새로고침 함수
  const refreshStats = async () => {
    if (!user) return;

    if (user.userRole === "ROLE_USER") {
      await fetchUserStats();
    } else if (user.userRole === "ROLE_STAFF") {
      await fetchStaffStats();
    } else if (user.userRole === "ROLE_ADMIN") {
      await fetchAdminStats();
    }
  };

  // 통계 데이터 가져오기
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        if (user.userRole === "ROLE_USER") {
          await fetchUserStats();
        } else if (user.userRole === "ROLE_STAFF") {
          await fetchStaffStats();
        } else if (user.userRole === "ROLE_ADMIN") {
          await fetchAdminStats();
        }
      } catch (error) {
        // 에러 처리
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user?.id, user?.userRole]);

  // 예약 상태 변경 이벤트 리스너 (관리자용 실시간 업데이트)
  useEffect(() => {
    if (!user || user.userRole !== "ROLE_ADMIN") return;

    window.addEventListener("reservationStatusChanged", refreshStats);

    const interval = setInterval(() => {
      fetchAdminStats();
    }, 30000);

    return () => {
      window.removeEventListener("reservationStatusChanged", refreshStats);
      clearInterval(interval);
    };
  }, [user]);

  if (!user) return null;

  // 사용자 역할에 따른 통계 카드 데이터
  const getStatCards = () => {
    if (user.userRole === "ROLE_USER") {
      return [
        {
          title: "예정된 예약",
          value: isLoading
            ? "..."
            : (userStats.upcomingReservations ?? 0).toString(),
          icon: <Calendar size={20} className="text-teal-500" />,
          bgColor: "bg-teal-50",
        },
        {
          title: "반려동물",
          value: isLoading ? "..." : (userStats.totalPets ?? 0).toString(),
          icon: <Dog size={20} className="text-blue-500" />,
          bgColor: "bg-blue-50",
        },
        {
          title: "진료내역",
          value: isLoading
            ? "..."
            : (userStats.totalTreatments ?? 0).toString(),
          icon: <Stethoscope size={20} className="text-purple-500" />,
          bgColor: "bg-purple-50",
        },
        {
          title: "마지막 내원일",
          value: isLoading
            ? "..."
            : userStats.lastVisitDate
            ? new Date(userStats.lastVisitDate)
                .toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
                .replace(/\./g, ".")
                .replace(/\s/g, "")
            : "없음",
          icon: <ClipboardPlus size={20} className="text-amber-500" />,
          bgColor: "bg-amber-50",
        },
      ];
    } else if (user.userRole === "ROLE_STAFF") {
      return [
        {
          title: "나의 오늘 예약",
          value: isLoading
            ? "..."
            : (staffStats.todayMyReservations ?? 0).toString(),
          icon: <CalendarCheck size={20} className="text-teal-500" />,
          bgColor: "bg-teal-50",
        },
        {
          title: "진료한 반려동물",
          value: isLoading ? "..." : (staffStats.myTreatedPets ?? 0).toString(),
          icon: <Dog size={20} className="text-blue-500" />,
          bgColor: "bg-blue-50",
        },
        {
          title: "승인 대기예약",
          value: isLoading
            ? "..."
            : (staffStats.pendingReservations ?? 0).toString(),
          icon: <Clock size={20} className="text-orange-500" />,
          bgColor: "bg-orange-50",
        },
        {
          title: "주간진료 / 주간예방접종",
          value: isLoading
            ? "..."
            : (staffStats.weeklyMyTreatments ?? 0).toString(),
          secondValue: isLoading
            ? "..."
            : (staffStats.weeklyVaccinations ?? 0).toString(),
          icon: <Stethoscope size={20} className="text-purple-500" />,
          bgColor: "bg-purple-50",
        },
      ];
    } else if (user.userRole === "ROLE_ADMIN") {
      return [
        {
          title: "오늘의 예약",
          value: isLoading
            ? "..."
            : (adminStats.todayTotalReservations ?? 0).toString(),
          icon: <CalendarCheck size={20} className="text-teal-500" />,
          bgColor: "bg-teal-50",
        },
        {
          title: "반려동물",
          value: isLoading ? "..." : (adminStats.totalPets ?? 0).toString(),
          icon: <Dog size={20} className="text-blue-500" />,
          bgColor: "bg-blue-50",
        },
        {
          title: "승인 대기예약",
          value: isLoading
            ? "..."
            : (adminStats.pendingReservations ?? 0).toString(),
          icon: <Clock size={20} className="text-orange-500" />,
          bgColor: "bg-orange-50",
        },
        {
          title: "최근진료 / 최근예방접종",
          value: isLoading
            ? "..."
            : (adminStats.weeklyCompletedTreatments ?? 0).toString(),
          secondValue: isLoading
            ? "..."
            : (adminStats.recentVaccinations ?? 0).toString(),
          icon: <Stethoscope size={20} className="text-purple-500" />,
          bgColor: "bg-purple-50",
        },
      ];
    }
    return [];
  };

  const statCards = getStatCards();

  return (
    <div className="p-8">
      {/* 상단 통계 카드 섹션 */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            secondValue={card.secondValue}
            icon={card.icon}
            bgColor={card.bgColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* 예약 현황 */}
        <div className="col-span-3">
          <ReservationStatus
            showCreateButton={true}
            isAdminView={
              user.userRole === "ROLE_ADMIN" || user.userRole === "ROLE_STAFF"
            }
            onReservationStatusChange={refreshStats}
          />
        </div>

        {/* 알림 및 공지사항 */}
        <div className="col-span-1 space-y-6">
          <div className="relative">
            <RecentReservations />
          </div>
          <div className="relative">
            <RecentNotices />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  secondValue?: string;
  icon: React.ReactNode;
  bgColor: string;
}

function StatCard({ title, value, secondValue, icon, bgColor }: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-lg shadow-sm p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          {secondValue ? (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-semibold">{value}</p>
              <span className="text-lg text-gray-400">/</span>
              <p className="text-2xl font-semibold">{secondValue}</p>
            </div>
          ) : (
            <p className="text-2xl font-semibold mt-1">{value}</p>
          )}
        </div>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
