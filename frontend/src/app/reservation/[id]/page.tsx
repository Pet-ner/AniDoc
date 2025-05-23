"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ChatRoom from "@/components/chat/ChatRoom";
import { useUser } from "@/contexts/UserContext";
import { formatDateToKorean } from "@/utils/formatDateToKorean";
import {
  CalendarDays,
  Clock,
  Bookmark,
  FileText,
  User,
  Calendar,
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
  createdAt: string;
  updatedAt: string;
}

export default function ReservationDetailPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const fetchReservation = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reservations/${id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("예약 정보를 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setReservation(data);
      } catch (error) {
        console.error("예약 정보 로드 오류:", error);
        alert("예약 정보를 불러오는데 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
        <p className="font-medium">알림</p>
        <p>예약 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-6">
        {/* 예약 정보 섹션 */}
        <div className="col-span-2 space-y-6">
          {/* 상태 표시 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-teal-500 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">예약 #{reservation.id}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium 
                  ${
                    reservation.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : reservation.status === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {reservation.status === "APPROVED"
                    ? "승인됨"
                    : reservation.status === "REJECTED"
                    ? "거절됨"
                    : "대기중"}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-y-6">
                <InfoItem
                  icon={<CalendarDays className="text-teal-500" />}
                  label="예약 날짜"
                  value={formatDateToKorean(reservation.reservationDate)}
                />

                <InfoItem
                  icon={<Clock className="text-teal-500" />}
                  label="예약 시간"
                  value={reservation.reservationTime.substring(0, 5)}
                />

                <InfoItem
                  icon={<Bookmark className="text-teal-500" />}
                  label="반려동물"
                  value={reservation.petName}
                />

                <InfoItem
                  icon={<Calendar className="text-teal-500" />}
                  label="예약 유형"
                  value={
                    reservation.type === "GENERAL" ? "일반 진료" : "예방접종"
                  }
                />

                <InfoItem
                  icon={<User className="text-teal-500" />}
                  label="예약자"
                  value={reservation.userName}
                  fullWidth={false}
                />

                <InfoItem
                  icon={<Calendar className="text-teal-500" />}
                  label="예약 생성일"
                  value={reservation.createdAt.split("T")[0]}
                  fullWidth={false}
                />
              </div>
            </div>
          </div>

          {/* 증상 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="flex items-center text-lg font-medium mb-4">
              <FileText className="text-teal-500 mr-2" size={20} />
              증상 및 참고사항
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {reservation.symptom ? (
                <p className="whitespace-pre-line">{reservation.symptom}</p>
              ) : (
                <p className="text-gray-500 italic">증상 정보가 없습니다.</p>
              )}
            </div>
          </div>

          {/* 진료 관련 정보 - 승인된 경우만 표시 */}
          {reservation.status === "APPROVED" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">진료 준비 안내</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>예약 시간 10분 전에 도착해주세요.</li>
                <li>반려동물 건강기록부가 있다면 지참해주세요.</li>
                <li>필요시 이전 병원 진료기록을 지참해주세요.</li>
              </ul>
            </div>
          )}
        </div>

        {/* 채팅 섹션 - 승인된 예약만 채팅 활성화 */}
        <div className="col-span-1 h-[600px]">
          {reservation.status === "APPROVED" ? (
            <ChatRoom reservationId={parseInt(id as string)} />
          ) : (
            <div className="h-full rounded-lg flex flex-col items-center justify-center text-gray-500 bg-white p-6 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <MessageSquareIcon className="text-gray-400" size={28} />
              </div>
              <p className="text-center mb-2 font-medium">1:1 상담 불가</p>
              <p className="text-center text-sm">
                예약이 승인되면 1:1 상담이 가능합니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 예약 정보 컴포넌트
function InfoItem({
  icon,
  label,
  value,
  fullWidth = true,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <div className="flex items-center">
        <div className="mr-3">{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="font-medium">{value}</p>
        </div>
      </div>
    </div>
  );
}

// MessageSquare 아이콘 컴포넌트
function MessageSquareIcon({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}
