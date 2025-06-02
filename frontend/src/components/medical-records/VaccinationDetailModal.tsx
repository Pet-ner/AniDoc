"use client";

import { X, Edit, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface VaccinationData {
  id: number;
  petName: string;
  doctorName: string;
  vaccineName: string;
  currentDose: number;
  totalDoses: number;
  vaccinationDate: string;
  nextDueDate?: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  notes?: string;
}

interface ReservationData {
  reservationId?: number;
  doctorId?: number;
}

interface VaccinationDetailModalProps {
  onClose: () => void;
  vaccinationData: VaccinationData;
  reservationData: ReservationData;
  onEdit?: () => void;
  userRole?: string;
  onUpdate?: (updatedData: VaccinationData) => void;
}

export default function VaccinationDetailModal({
  onClose,
  vaccinationData,
  reservationData,
  onEdit,
  userRole,
  onUpdate,
}: VaccinationDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(vaccinationData);
  const [loading, setLoading] = useState(false);

  const getVaccineNameInKorean = (englishName: string) => {
    const vaccineMap: { [key: string]: string } = {
      DHPPL: "종합백신(DHPPL)",
      CORONA: "코로나 장염",
      KENNEL_COUGH: "켄넬코프",
      INFLUENZA: "인플루엔자",
      RABIES: "광견병",
      ANTIBODY_TEST: "항체가검사",
      HEARTWORM: "심장사상충",
      FVRCP: "종합백신(FVRCP)",
      FIP: "전염성 복막염",
    };
    return vaccineMap[englishName] || englishName;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return "미접종";
      case "IN_PROGRESS":
        return "접종진행중";
      case "COMPLETED":
        return "접종완료";
      default:
        return "-";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctor/vaccines/${vaccinationData.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doctorId: reservationData.doctorId,
            reservationId: reservationData.reservationId,
            vaccineName: editData.vaccineName,
            currentDose: editData.currentDose,
            totalDoses: editData.totalDoses,
            vaccinationDate: editData.vaccinationDate,
            nextDueDate: null,
            status: editData.status,
            notes: editData.notes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("백신 기록 수정에 실패했습니다");
      }

      const updatedVaccinationData = {
        ...vaccinationData,
        ...editData,
      };

      // 상태 업데이트
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(updatedVaccinationData);
      }

      toast.success("백신 기록이 성공적으로 수정되었습니다.");
    } catch (error) {
      console.error("백신 기록 수정 오류:", error);
      toast.error("백신 기록 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          disabled={loading}
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-teal-700">
          예방접종 기록 상세
        </h2>

        {/* 기본 정보 (항상 읽기 전용) */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">반려동물</label>
            <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
              {vaccinationData.petName}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">담당의</label>
            <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
              {vaccinationData.doctorName}
            </div>
          </div>
        </div>

        {/* 백신 정보 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">백신명</label>
            {isEditing ? (
              <select
                value={editData.vaccineName}
                onChange={(e) =>
                  setEditData({ ...editData, vaccineName: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:border-teal-500 focus:ring-teal-500"
                disabled={loading}
              >
                <option value="DHPPL">종합백신(DHPPL)</option>
                <option value="CORONA">코로나 장염</option>
                <option value="KENNEL_COUGH">켄넬코프</option>
                <option value="INFLUENZA">인플루엔자</option>
                <option value="RABIES">광견병</option>
                <option value="ANTIBODY_TEST">항체가검사</option>
                <option value="HEARTWORM">심장사상충</option>
                <option value="FVRCP">종합백신(FVRCP)</option>
                <option value="FIP">전염성 복막염</option>
              </select>
            ) : (
              <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
                {getVaccineNameInKorean(vaccinationData.vaccineName)}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              접종 상태
            </label>
            {isEditing ? (
              <select
                value={editData.status}
                onChange={(e) =>
                  setEditData({ ...editData, status: e.target.value as any })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:border-teal-500 focus:ring-teal-500"
                disabled={loading}
              >
                <option value="NOT_STARTED">미접종</option>
                <option value="IN_PROGRESS">접종진행중</option>
                <option value="COMPLETED">접종완료</option>
              </select>
            ) : (
              <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2">
                <span
                  className={`font-medium "text-gray-600"
                  }`}
                >
                  {getStatusText(vaccinationData.status)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 접종 회차 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              현재 회차
            </label>
            {isEditing ? (
              <input
                type="number"
                min="1"
                value={editData.currentDose}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    currentDose: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:border-teal-500 focus:ring-teal-500"
                disabled={loading}
              />
            ) : (
              <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
                {vaccinationData.currentDose}회차
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">총 회차</label>
            {isEditing ? (
              <input
                type="number"
                min="1"
                value={editData.totalDoses}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    totalDoses: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:border-teal-500 focus:ring-teal-500"
                disabled={loading}
              />
            ) : (
              <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
                {vaccinationData.totalDoses}회차
              </div>
            )}
          </div>
        </div>

        {/* 접종일 */}
        <div className="mb-6">
          <label className="block text-xs text-gray-500 mb-1">접종일</label>
          <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
            {formatDate(vaccinationData.vaccinationDate)}
          </div>
        </div>

        {/* 메모 */}
        <div className="mb-6">
          <label className="block text-xs text-gray-500 mb-1">메모</label>
          {isEditing ? (
            <textarea
              value={editData.notes || ""}
              onChange={(e) =>
                setEditData({ ...editData, notes: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 focus:border-teal-500 focus:ring-teal-500 min-h-[80px]"
              placeholder="메모를 입력하세요"
              disabled={loading}
            />
          ) : (
            <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700 min-h-[80px]">
              {vaccinationData.notes || "-"}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex justify-between">
          {userRole !== "ROLE_USER" && (
            <>
              {isEditing ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 rounded bg-teal-600 text-white text-lg hover:bg-teal-700 disabled:bg-teal-300 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        저장 중...
                      </>
                    ) : (
                      <>저장</>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditData(vaccinationData);
                    }}
                    disabled={loading}
                    className="px-6 py-3 rounded bg-gray-100 text-gray-700 text-lg hover:bg-gray-200"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 rounded bg-teal-600 text-white text-lg hover:bg-teal-700 flex items-center gap-2"
                >
                  수정
                </button>
              )}
            </>
          )}
          <button
            onClick={onClose}
            disabled={loading}
            className={`px-6 py-3 rounded bg-gray-100 text-gray-700 text-lg hover:bg-gray-200 ${
              userRole === "ROLE_USER" ? "w-full" : ""
            }`}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
