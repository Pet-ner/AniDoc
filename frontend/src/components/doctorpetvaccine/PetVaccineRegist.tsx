"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

type VaccinationStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

interface Reservation {
  id: number;
  userId: number;
  userName?: string;
  petId: number;
  petName?: string;
  doctorId?: number;
  doctorName?: string;
  reservationDate: string;
  reservationTime: string;
  status: string;
  symptom: string;
  type: "GENERAL" | "VACCINATION";
  createdAt: string;
  updatedAt: string;
}

interface VaccineRegistData {
  doctorId: number;
  reservationId: number;
  vaccineName: string;
  currentDose: number;
  totalDoses: number;
  vaccinationDate: string;
  nextDueDate: string | null;
  status: VaccinationStatus;
  notes: string;
}

interface PetVaccineRegistModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: number;
  doctorId: number;
  onSubmit: (data: VaccineRegistData) => Promise<void>;
  availableReservations: Reservation[];
}

const statusOptions: { value: VaccinationStatus; label: string }[] = [
  { value: "NOT_STARTED", label: "미접종" },
  { value: "IN_PROGRESS", label: "접종진행중" },
  { value: "COMPLETED", label: "접종완료" },
];

export default function PetVaccineRegistModal({
  isOpen,
  onClose,
  petId,
  doctorId,
  onSubmit,
  availableReservations,
}: PetVaccineRegistModalProps) {
  const [formData, setFormData] = useState<VaccineRegistData>({
    doctorId: doctorId,
    reservationId: 0,
    vaccineName: "",
    currentDose: 1,
    totalDoses: 1,
    vaccinationDate: new Date().toISOString().split("T")[0],
    nextDueDate: null,
    status: "NOT_STARTED",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  // 모달이 열릴 때마다 폼 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData({
        doctorId: doctorId,
        reservationId: 0,
        vaccineName: "",
        currentDose: 1,
        totalDoses: 1,
        vaccinationDate: new Date().toISOString().split("T")[0],
        nextDueDate: null,
        status: "NOT_STARTED",
        notes: "",
      });
    }
  }, [isOpen, doctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reservationId || formData.reservationId === 0) {
      toast.error("예약을 반드시 선택해야 합니다.");
      return;
    }
    if (!formData.doctorId || formData.doctorId === 0) {
      toast.error("의사 정보가 올바르지 않습니다. 다시 로그인 해주세요.");
      return;
    }
    if (!formData.vaccineName.trim()) {
      toast.error("백신 이름을 입력해주세요.");
      return;
    }
    if (!formData.vaccinationDate) {
      toast.error("접종일을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("등록 오류:", error);
      toast.error("예방접종 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold">예방접종 등록</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 예약 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              예약 선택 * (내가 담당인 승인된 예약만 표시)
            </label>
            <select
              value={formData.reservationId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reservationId: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              required
            >
              <option value={0}>예약을 선택하세요</option>
              {availableReservations.map((reservation) => (
                <option key={reservation.id} value={reservation.id}>
                  {reservation.reservationDate} {reservation.reservationTime} /{" "}
                  {reservation.userName} / {reservation.petName}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              내 담당 승인된 예약: {availableReservations.length}개
            </p>
          </div>

          {/* 백신 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              백신 이름 *
            </label>
            <input
              type="text"
              value={formData.vaccineName}
              onChange={(e) =>
                setFormData({ ...formData, vaccineName: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              placeholder="예: 종합백신, 광견병 백신"
              required
            />
          </div>

          {/* 현재 차수 / 총 차수 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                현재 차수 *
              </label>
              <input
                type="number"
                min="1"
                value={formData.currentDose}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentDose: parseInt(e.target.value) || 1,
                  })
                }
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                총 차수 *
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalDoses}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalDoses: parseInt(e.target.value) || 1,
                  })
                }
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
          </div>

          {/* 접종일 / 다음 접종일 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                접종일 *
              </label>
              <input
                type="date"
                value={formData.vaccinationDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vaccinationDate: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                다음 접종일
              </label>
              <input
                type="date"
                value={formData.nextDueDate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nextDueDate: e.target.value || null,
                  })
                }
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
              />
            </div>
          </div>

          {/* 접종 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              접종 상태 *
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as VaccinationStatus,
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              required
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              메모
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-gray-300 p-2 h-24"
              placeholder="접종 후 반응, 주의사항 등"
            />
          </div>

          {/* 버튼 순서 재변경: 등록 버튼이 왼쪽, 취소 버튼이 오른쪽 */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-teal-300 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  등록 중...
                </>
              ) : (
                "등록"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
