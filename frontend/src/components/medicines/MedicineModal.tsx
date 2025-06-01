"use client";

import { useState } from "react";
import type { MedicineModalProps } from "@/types/medicine";

export default function MedicineModal({
  isOpen,
  onClose,
  medicine,
  onSave,
}: MedicineModalProps) {
  const [formData, setFormData] = useState({
    medicationName: medicine?.medicationName || "",
    stock: medicine?.stock || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medicationName.trim()) {
      alert("약품명을 입력해주세요.");
      return;
    }

    if (formData.stock < 0) {
      alert("재고 수량은 0 이상이어야 합니다.");
      return;
    }

    try {
      setLoading(true);
      const url = medicine
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medicines/${medicine.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medicines`;

      const method = medicine ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(
          medicine ? "약품 수정에 실패했습니다." : "약품 추가에 실패했습니다."
        );
      }

      alert(medicine ? "약품이 수정되었습니다." : "약품이 추가되었습니다.");
      onSave();
    } catch (error) {
      console.error("약품 저장 오류:", error);
      alert(
        medicine ? "약품 수정에 실패했습니다." : "약품 추가에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {medicine ? "약품 정보 수정" : "새 약품 추가"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              약품명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.medicationName}
              onChange={(e) =>
                setFormData({ ...formData, medicationName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="약품명을 입력하세요"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              재고 수량 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-300"
              disabled={loading}
            >
              {loading ? "처리 중..." : medicine ? "수정" : "추가"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
