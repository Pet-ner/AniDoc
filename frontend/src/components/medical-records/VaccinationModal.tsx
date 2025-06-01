"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface MedicalRecord {
  id: number;
  reservationId: number;
  petName: string;
  petId?: number;
  doctorId?: number;
  reservationDate?: string;
  reservationTime: string;
  userId: number;
  petSpecies: string;
}

interface VaccinationModalProps {
  onClose: () => void;
  record: MedicalRecord;
  onSaved: () => void;
}

// 백신 종류 옵션
const VACCINE_OPTIONS = {
  DOG: [
    { value: "DHPPL", label: "종합백신(DHPPL)" },
    { value: "CORONA", label: "코로나 장염" },
    { value: "KENNEL_COUGH", label: "켄넬코프" },
    { value: "INFLUENZA", label: "인플루엔자" },
    { value: "RABIES", label: "광견병" },
    { value: "ANTIBODY_TEST", label: "항체가검사" },
    { value: "HEARTWORM", label: "심장사상충" },
  ],
  CAT: [
    { value: "FVRCP", label: "종합백신(FVRCP)" },
    { value: "RABIES", label: "광견병" },
    { value: "FIP", label: "전염성 복막염" },
    { value: "ANTIBODY_TEST", label: "항체가검사" },
    { value: "HEARTWORM", label: "심장사상충" },
  ],
};

export default function VaccinationModal({
  onClose,
  record,
  onSaved,
}: VaccinationModalProps) {
  const [formData, setFormData] = useState({
    petType: record.petSpecies,
    vaccineName: "",
    currentDose: 1,
    totalDoses: 1,
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vaccineName.trim()) {
      alert("백신 종류를 선택해주세요.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        doctorId: record.doctorId,
        reservationId: record.id,
        vaccineName: formData.vaccineName,
        currentDose: formData.currentDose,
        totalDoses: formData.totalDoses,
        notes: formData.notes,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctor/vaccines/${record.petId}/vaccinereg`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "백신 기록 등록에 실패했습니다");
      }

      alert("백신 기록이 성공적으로 등록되었습니다.");
      onSaved();
      onClose();
    } catch (error) {
      console.error("백신 기록 등록 오류:", error);
      alert(
        `백신 기록 등록에 실패했습니다: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const currentVaccineOptions =
    formData.petType === "강아지"
      ? VACCINE_OPTIONS.DOG
      : formData.petType === "고양이"
      ? VACCINE_OPTIONS.CAT
      : VACCINE_OPTIONS.DOG;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">백신 기록 작성</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 반려동물 종류 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              반려동물 종류 *
            </label>
            <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
              {formData.petType}
            </div>
          </div>

          {/* 백신 종류 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              백신 종류 *
            </label>
            <select
              value={formData.vaccineName}
              onChange={(e) => handleInputChange("vaccineName", e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-teal-500 focus:ring-teal-500"
              required
              disabled={loading}
            >
              <option value="">백신 종류를 선택하세요</option>
              {currentVaccineOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 현재 차수 / 총 차수 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                현재 차수 *
              </label>
              <input
                type="number"
                min="1"
                value={formData.currentDose}
                onChange={(e) =>
                  handleInputChange(
                    "currentDose",
                    parseInt(e.target.value) || 1
                  )
                }
                className="w-full rounded-md border border-gray-300 p-2 focus:border-teal-500 focus:ring-teal-500"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                총 차수 *
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalDoses}
                onChange={(e) =>
                  handleInputChange("totalDoses", parseInt(e.target.value) || 1)
                }
                className="w-full rounded-md border border-gray-300 p-2 focus:border-teal-500 focus:ring-teal-500"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-teal-500 focus:ring-teal-500"
              placeholder="접종 후 반응, 주의사항 등"
              disabled={loading}
            />
          </div>

          {/* 안내 메시지 */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
            <p className="text-sm text-teal-800">
              <strong>안내:</strong>
              <br />• 접종일은 예약일({record.reservationDate})로 자동
              설정됩니다.
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-teal-300"
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
