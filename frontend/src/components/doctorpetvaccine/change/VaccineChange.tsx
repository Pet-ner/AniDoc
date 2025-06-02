"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

// VaccinationStatus enum
enum VaccinationStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

// Vaccination 인터페이스
interface Vaccination {
  id: number;
  petName: string;
  doctorId: number;
  doctorName: string;
  reservationId: number;
  vaccineName: string;
  currentDose: number;
  totalDoses: number;
  vaccinationDate: string;
  nextDueDate: string | null;
  status: VaccinationStatus;
  notes: string | null;
}

// 수정 요청 DTO
interface VaccineUpdateRequest {
  doctorId: number;
  reservationId: number;
  vaccineName: string;
  currentDose: number;
  totalDoses: number;
  vaccinationDate: string;
  nextDueDate: string | null;
  status: VaccinationStatus;
  notes: string | null;
}

interface VaccineChangeProps {
  isOpen: boolean;
  onClose: () => void;
  vaccination: Vaccination;
  onSuccess: () => void;
}

const VaccineChange: React.FC<VaccineChangeProps> = ({
  isOpen,
  onClose,
  vaccination,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<VaccineUpdateRequest>({
    doctorId: vaccination.doctorId,
    reservationId: vaccination.reservationId,
    vaccineName: vaccination.vaccineName,
    currentDose: vaccination.currentDose,
    totalDoses: vaccination.totalDoses,
    vaccinationDate: vaccination.vaccinationDate,
    nextDueDate: vaccination.nextDueDate,
    status: vaccination.status,
    notes: vaccination.notes,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // vaccination이 변경될 때마다 formData 업데이트
  useEffect(() => {
    if (vaccination) {
      setFormData({
        doctorId: vaccination.doctorId,
        reservationId: vaccination.reservationId,
        vaccineName: vaccination.vaccineName,
        currentDose: vaccination.currentDose,
        totalDoses: vaccination.totalDoses,
        vaccinationDate: vaccination.vaccinationDate,
        nextDueDate: vaccination.nextDueDate,
        status: vaccination.status,
        notes: vaccination.notes,
      });
    }
  }, [vaccination]);

  // 날짜를 백엔드 형식으로 변환
  const formatDateForBackend = (dateString: string): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  };

  // 입력값 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "currentDose" ||
        name === "totalDoses" ||
        name === "doctorId" ||
        name === "reservationId"
          ? parseInt(value) || 0
          : value,
    }));

    // 에러 메시지 제거
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vaccineName.trim()) {
      newErrors.vaccineName = "백신명을 입력해주세요.";
    }

    if (formData.currentDose <= 0) {
      newErrors.currentDose = "현재 접종 회차를 입력해주세요.";
    }

    if (formData.totalDoses <= 0) {
      newErrors.totalDoses = "총 접종 회차를 입력해주세요.";
    }

    if (formData.currentDose > formData.totalDoses) {
      newErrors.currentDose = "현재 회차는 총 회차보다 클 수 없습니다.";
    }

    if (!formData.vaccinationDate) {
      newErrors.vaccinationDate = "접종일을 선택해주세요.";
    }

    if (!formData.status) {
      newErrors.status = "접종 상태를 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 백신 수정 API 호출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("=== Vaccine Update Debug ===");
      console.log("Vaccination ID:", vaccination.id);
      console.log("Original form data:", formData);

      // 날짜 형식 변환
      const formattedData = {
        ...formData,
        vaccinationDate: formatDateForBackend(formData.vaccinationDate),
        nextDueDate: formData.nextDueDate
          ? formatDateForBackend(formData.nextDueDate)
          : null,
      };

      console.log("Formatted data for API:", formattedData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctor/vaccines/${vaccination.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.message || "백신 정보 수정에 실패했습니다");
      }

      const result = await response.json();
      console.log("Update successful:", result);

      toast.success("백신 정보가 성공적으로 수정되었습니다.");
      onSuccess(); // 부모 컴포넌트에 성공 알림
      onClose(); // 모달 닫기
    } catch (error) {
      console.error("Error updating vaccine:", error);
      toast.error("백신 정보 수정에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // 접종 상태 한글 변환
  const getStatusText = (status: VaccinationStatus) => {
    switch (status) {
      case VaccinationStatus.NOT_STARTED:
        return "미접종";
      case VaccinationStatus.IN_PROGRESS:
        return "접종진행중";
      case VaccinationStatus.COMPLETED:
        return "접종완료";
      default:
        return "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            백신 정보 수정 - {vaccination.petName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 백신명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              백신명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vaccineName"
              value={formData.vaccineName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.vaccineName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="백신명을 입력하세요"
              disabled={isLoading}
            />
            {errors.vaccineName && (
              <p className="text-red-500 text-xs mt-1">{errors.vaccineName}</p>
            )}
          </div>

          {/* 접종 회차 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                현재 회차 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="currentDose"
                value={formData.currentDose}
                onChange={handleInputChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.currentDose ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.currentDose && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.currentDose}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                총 회차 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalDoses"
                value={formData.totalDoses}
                onChange={handleInputChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.totalDoses ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.totalDoses && (
                <p className="text-red-500 text-xs mt-1">{errors.totalDoses}</p>
              )}
            </div>
          </div>

          {/* 접종일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              접종일 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="vaccinationDate"
              value={formData.vaccinationDate}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.vaccinationDate ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.vaccinationDate && (
              <p className="text-red-500 text-xs mt-1">
                {errors.vaccinationDate}
              </p>
            )}
          </div>

          {/* 다음 접종일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              다음 접종일
            </label>
            <input
              type="date"
              name="nextDueDate"
              value={formData.nextDueDate || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* 접종 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              접종 상태 <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.status ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
            >
              <option value="">접종 상태를 선택하세요</option>
              <option value={VaccinationStatus.NOT_STARTED}>
                {getStatusText(VaccinationStatus.NOT_STARTED)}
              </option>
              <option value={VaccinationStatus.IN_PROGRESS}>
                {getStatusText(VaccinationStatus.IN_PROGRESS)}
              </option>
              <option value={VaccinationStatus.COMPLETED}>
                {getStatusText(VaccinationStatus.COMPLETED)}
              </option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-xs mt-1">{errors.status}</p>
            )}
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모
            </label>
            <textarea
              name="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="메모를 입력하세요"
              disabled={isLoading}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "수정 중..." : "수정"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaccineChange;
