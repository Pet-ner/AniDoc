"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import ReservationStatus from "@/components/ReservationStatus";
import { User, Check, X, Clock } from "lucide-react";

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
  const { user } = useUser();
  const [selectedDateReservations, setSelectedDateReservations] = useState<
    Reservation[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningDoctor, setAssigningDoctor] = useState<{
    reservationId: number;
    doctorId: number | null;
  } | null>(null);

  // 의사 목록 조회
  useEffect(() => {
    if (!user) return;

    const fetchDoctors = async () => {
      try {
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
        setDoctors([]);
      }
    };

    fetchDoctors();
  }, [user]);

  // 날짜 선택 핸들러
  const handleDateSelect = (date: string, reservations: Reservation[]) => {
    setSelectedDate(date);
    setSelectedDateReservations(reservations);
  };

  // 의사 배정 처리
  const handleAssignDoctor = async () => {
    if (!assigningDoctor || !assigningDoctor.doctorId) return;

    try {
      setLoading(true);

      const requestData = {
        doctorId: assigningDoctor.doctorId,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reservations/${
          assigningDoctor.reservationId
        }/doctor?userId=${user!.id}`,
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

      // 예약 목록 업데이트
      const updatedReservations = selectedDateReservations.map((r) => {
        if (r.id === updatedReservation.id) {
          return updatedReservation;
        }
        return r;
      });

      setSelectedDateReservations(updatedReservations);
      setAssigningDoctor(null);
      alert("담당의가 성공적으로 배정되었습니다.");
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

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/reservations/${reservationId}/status?userId=${user!.id}`,
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

      // 예약 목록 업데이트
      const updatedReservations = selectedDateReservations.map((r) => {
        if (r.id === updatedReservation.id) {
          return updatedReservation;
        }
        return r;
      });

      setSelectedDateReservations(updatedReservations);

      const statusText = newStatus === "APPROVED" ? "승인" : "거절";
      alert(`예약이 성공적으로 ${statusText}되었습니다.`);
    } catch (error: any) {
      console.error("상태 변경 오류:", error);
      alert(error.message || "상태 변경 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">예약 관리</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* 예약 현황 */}
        <ReservationStatus
          onDateSelect={handleDateSelect}
          showCreateButton={false}
          isAdminView={true}
        />

        {/* 관리 테이블 */}
        {selectedDate && (
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      예약 시간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      환자명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      반려동물명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      진료 유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      담당의
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      예약 상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      메모
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedDateReservations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        선택한 날짜에 예약이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    selectedDateReservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {reservation.reservationTime.substring(0, 5)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.userName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.petName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {reservation.type === "GENERAL"
                              ? "일반진료"
                              : "예방접종"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {reservation.doctorName ? (
                            <div className="text-sm text-gray-900">
                              {reservation.doctorName}
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setAssigningDoctor({
                                  reservationId: reservation.id,
                                  doctorId: null,
                                })
                              }
                              className="text-teal-600 hover:text-teal-800 text-sm font-medium hover:underline"
                            >
                              배정하기
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              reservation.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : reservation.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {reservation.status === "APPROVED"
                              ? "승인됨"
                              : reservation.status === "PENDING"
                              ? "대기중"
                              : "거절됨"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {reservation.symptom ? (
                              <div
                                className="text-sm text-gray-900 truncate"
                                title={reservation.symptom}
                              >
                                {reservation.symptom}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">
                                메모 없음
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            {reservation.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(
                                      reservation.id,
                                      "APPROVED"
                                    )
                                  }
                                  className="text-green-600 hover:text-green-800"
                                  title="승인"
                                  disabled={loading}
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(
                                      reservation.id,
                                      "REJECTED"
                                    )
                                  }
                                  className="text-red-600 hover:text-red-800"
                                  title="거절"
                                  disabled={loading}
                                >
                                  <X size={18} />
                                </button>
                              </>
                            )}
                            {reservation.status !== "PENDING" && (
                              <span className="text-green-600 text-sm">
                                처리완료
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
                disabled={!assigningDoctor.doctorId || loading}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? "배정 중..." : "배정하기"}
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
    </div>
  );
}
