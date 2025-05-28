import React, { useState, useEffect } from "react";
import { Pet } from "@/app/doctorpet/page";

// Gender enum 직접 정의
enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

interface PetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  petData: Pet;
  onSave: (data: Pet) => Promise<void>;
}

const PetDetailModal: React.FC<PetDetailModalProps> = ({
  isOpen,
  onClose,
  petData,
  onSave,
}) => {
  const [editedData, setEditedData] = useState<Pet>({
    ...petData,
    // Ensure all fields have default values
    name: petData.name || "",
    gender: petData.gender || Gender.MALE,
    species: petData.species || "",
    breed: petData.breed || "",
    birth: petData.birth || "",
    weight: petData.weight || 0,
    isNeutered: petData.isNeutered || false,
    neuteredDate: petData.neuteredDate || "",
    isDeceased: petData.isDeceased || false,
    deceasedDate: petData.deceasedDate || "",
    surgeryCount: petData.surgeryCount || 0,
    hospitalizationCount: petData.hospitalizationCount || 0,
    lastDiroDate: petData.lastDiroDate || "",
    lastVisitDate: petData.lastVisitDate || "",
    profileUrl: petData.profileUrl || "",
    specialNote: petData.specialNote || "",
    owner: petData.owner || { id: 0, name: "" },
  });

  // Update editedData when petData changes
  useEffect(() => {
    setEditedData({
      ...petData,
      // Ensure all fields have default values
      name: petData.name || "",
      gender: petData.gender || Gender.MALE,
      species: petData.species || "",
      breed: petData.breed || "",
      birth: petData.birth || "",
      weight: petData.weight || 0,
      isNeutered: petData.isNeutered || false,
      neuteredDate: petData.neuteredDate || "",
      isDeceased: petData.isDeceased || false,
      deceasedDate: petData.deceasedDate || "",
      surgeryCount: petData.surgeryCount || 0,
      hospitalizationCount: petData.hospitalizationCount || 0,
      lastDiroDate: petData.lastDiroDate || "",
      lastVisitDate: petData.lastVisitDate || "",
      profileUrl: petData.profileUrl || "",
      specialNote: petData.specialNote || "",
      owner: petData.owner || { id: 0, name: "" },
    });
  }, [petData]);

  // handleChange 함수의 타입 정의 수정
  const handleChange = (
    field: keyof Pet,
    value: string | number | boolean | Gender | null // null 타입 추가
  ) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // Convert empty strings to null for API submission
      const submitData = {
        ...editedData,
        neuteredDate: editedData.neuteredDate || null,
        deceasedDate: editedData.deceasedDate || null,
        lastDiroDate: editedData.lastDiroDate || null,
        lastVisitDate: editedData.lastVisitDate || null,
        profileUrl: editedData.profileUrl || null,
      };
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert("반려동물 정보 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">반려동물 상세 정보</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-gray-500 text-sm">이름</label>
            <input
              type="text"
              value={editedData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">종</label>
            <input
              type="text"
              value={editedData.species}
              onChange={(e) => handleChange("species", e.target.value)}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">품종</label>
            <input
              type="text"
              value={editedData.breed}
              onChange={(e) => handleChange("breed", e.target.value)}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">생년월일</label>
            <input
              type="date"
              value={editedData.birth}
              onChange={(e) => handleChange("birth", e.target.value)}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">성별</label>
            <select
              value={editedData.gender}
              onChange={(e) => handleChange("gender", e.target.value as Gender)}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={Gender.MALE}>수컷</option>
              <option value={Gender.FEMALE}>암컷</option>
            </select>
          </div>

          <div>
            <label className="text-gray-500 text-sm">체중</label>
            <input
              type="number"
              step="0.1"
              value={editedData.weight}
              onChange={(e) =>
                handleChange("weight", parseFloat(e.target.value))
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">중성화 여부</label>
            <select
              value={editedData.isNeutered ? "true" : "false"}
              onChange={(e) =>
                handleChange("isNeutered", e.target.value === "true")
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="true">완료</option>
              <option value="false">미완료</option>
            </select>
          </div>

          <div>
            <label className="text-gray-500 text-sm">중성화 날짜</label>
            <input
              type="date"
              value={editedData.neuteredDate || ""}
              onChange={(e) =>
                handleChange("neuteredDate", e.target.value || null)
              }
              disabled={!editedData.isNeutered}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">사망 여부</label>
            <select
              value={editedData.isDeceased ? "true" : "false"}
              onChange={(e) =>
                handleChange("isDeceased", e.target.value === "true")
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="false">생존</option>
              <option value="true">사망</option>
            </select>
          </div>

          <div>
            <label className="text-gray-500 text-sm">사망 날짜</label>
            <input
              type="date"
              value={editedData.deceasedDate || ""}
              onChange={(e) =>
                handleChange("deceasedDate", e.target.value || null)
              }
              disabled={!editedData.isDeceased}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">수술 횟수</label>
            <input
              type="number"
              min="0"
              value={editedData.surgeryCount}
              onChange={(e) =>
                handleChange("surgeryCount", parseInt(e.target.value))
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">입원 횟수</label>
            <input
              type="number"
              min="0"
              value={editedData.hospitalizationCount}
              onChange={(e) =>
                handleChange("hospitalizationCount", parseInt(e.target.value))
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">
              마지막 심장사상충 투약일
            </label>
            <input
              type="date"
              value={editedData.lastDiroDate || ""}
              onChange={(e) =>
                handleChange("lastDiroDate", e.target.value || null)
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="text-gray-500 text-sm">특이사항</label>
          <textarea
            value={editedData.specialNote}
            onChange={(e) => handleChange("specialNote", e.target.value)}
            className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
          />
        </div>

        {/* 버튼 순서 변경: 저장 버튼이 왼쪽, 취소 버튼이 오른쪽 */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            저장
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetDetailModal;
