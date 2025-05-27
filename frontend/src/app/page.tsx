"use client";

import { useUser } from "@/contexts/UserContext";
import { Calendar, Dog, Stethoscope, ClipboardPlus } from "lucide-react";
import ReservationStatus from "@/components/ReservationStatus";
import RecentReservations from "@/components/RecentReservations";
import RecentNotices from "@/components/RecentNotices";

export default function Home() {
  const { user } = useUser();

  if (!user) return null;

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

      <div className="grid grid-cols-4 gap-6">
        {/* 예약 현황 */}
        <div className="col-span-3">
          <ReservationStatus showCreateButton={true} isAdminView={false} />
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
