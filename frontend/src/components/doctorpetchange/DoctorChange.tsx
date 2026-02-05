import React, { useState, useEffect } from "react";
import { Pet, Gender } from "@/app/doctorpet/page"; // Pet과 Gender 타입 import
import { toast } from "react-hot-toast";
// Pet 인터페이스 직접 정의 제거
// interface Pet { ... } 이 부분 삭제

// Gender enum 직접 정의 제거
// enum Gender { ... } 이 부분 삭제

// Props 인터페이스 정의 (import된 Pet 타입 사용)
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
    // 모든 필드에 null 방지 처리
    name: petData.name ?? "",
    species: petData.species ?? "",
    breed: petData.breed ?? "",
    birth: petData.birth ?? "",
    neuteredDate: petData.neuteredDate ?? "",
    deceasedDate: petData.deceasedDate ?? "",
    lastDiroDate: petData.lastDiroDate ?? "",
    lastVisitDate: petData.lastVisitDate ?? "",
    profileUrl: petData.profileUrl ?? "",
    specialNote: petData.specialNote ?? "",
    weight: petData.weight ?? 0,
    surgeryCount: petData.surgeryCount ?? 0,
    hospitalizationCount: petData.hospitalizationCount ?? 0,
    isNeutered: petData.isNeutered === true,
    isDeceased: petData.isDeceased === true,
  });

  // petData가 변경될 때 editedData 업데이트
  useEffect(() => {
    console.log("PetData changed in modal:", petData);
    setEditedData({
      ...petData,
      name: petData.name ?? "",
      species: petData.species ?? "",
      breed: petData.breed ?? "",
      birth: petData.birth ?? "",
      neuteredDate: petData.neuteredDate ?? "",
      deceasedDate: petData.deceasedDate ?? "",
      lastDiroDate: petData.lastDiroDate ?? "",
      lastVisitDate: petData.lastVisitDate ?? "",
      profileUrl: petData.profileUrl ?? "",
      specialNote: petData.specialNote ?? "",
      weight: petData.weight ?? 0,
      surgeryCount: petData.surgeryCount ?? 0,
      hospitalizationCount: petData.hospitalizationCount ?? 0,
      isNeutered: petData.isNeutered === true,
      isDeceased: petData.isDeceased === true,
    });
  }, [petData]);

  // 중성화 여부 변경 핸들러
  const handleNeuteredChange = (value: string) => {
    const boolValue = value === "true";
    setEditedData((prev) => ({
      ...prev,
      isNeutered: boolValue,
      neuteredDate: boolValue ? prev.neuteredDate : "",
    }));
  };

  // 사망 여부 변경 핸들러
  const handleDeceasedChange = (value: string) => {
    const boolValue = value === "true";
    setEditedData((prev) => ({
      ...prev,
      isDeceased: boolValue,
      deceasedDate: boolValue ? prev.deceasedDate : "",
    }));
  };

  const handleSubmit = async () => {
    try {
      const submitData: Pet = {
        ...editedData,
        neuteredDate: editedData.neuteredDate || null,
        deceasedDate: editedData.deceasedDate || null,
        lastDiroDate: editedData.lastDiroDate || null,
        profileUrl: editedData.profileUrl || null,
      };

      await onSave(submitData);
    } catch (error) {
      console.error("Error in modal handleSubmit:", error);
      toast.error("반려동물 정보 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">반려동물 상세 정보</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-gray-500 text-sm">이름</label>
            <input
              type="text"
              value={editedData.name ?? ""}
              onChange={(e) =>
                setEditedData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">종</label>
            <input
              type="text"
              value={editedData.species ?? ""}
              onChange={(e) =>
                setEditedData((prev) => ({ ...prev, species: e.target.value }))
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">품종</label>
            <input
              type="text"
              value={editedData.breed ?? ""}
              onChange={(e) =>
                setEditedData((prev) => ({ ...prev, breed: e.target.value }))
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">생년월일</label>
            <input
              type="date"
              value={editedData.birth ?? ""}
              onChange={(e) =>
                setEditedData((prev) => ({ ...prev, birth: e.target.value }))
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">성별</label>
            <select
              value={editedData.gender ?? Gender.MALE}
              onChange={(e) =>
                setEditedData((prev) => ({
                  ...prev,
                  gender: e.target.value as Gender, // Gender enum 타입으로 캐스팅
                }))
              }
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
              value={editedData.weight ?? 0}
              onChange={(e) =>
                setEditedData((prev) => ({
                  ...prev,
                  weight: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">중성화 여부</label>
            <select
              value={editedData.isNeutered === true ? "true" : "false"}
              onChange={(e) => handleNeuteredChange(e.target.value)}
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
              value={editedData.neuteredDate ?? ""}
              onChange={(e) =>
                setEditedData((prev) => ({
                  ...prev,
                  neuteredDate: e.target.value,
                }))
              }
              disabled={editedData.isNeutered !== true}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">사망 여부</label>
            <select
              value={editedData.isDeceased === true ? "true" : "false"}
              onChange={(e) => handleDeceasedChange(e.target.value)}
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
              value={editedData.deceasedDate ?? ""}
              onChange={(e) =>
                setEditedData((prev) => ({
                  ...prev,
                  deceasedDate: e.target.value,
                }))
              }
              disabled={editedData.isDeceased !== true}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">수술 횟수</label>
            <input
              type="number"
              min="0"
              value={editedData.surgeryCount ?? 0}
              onChange={(e) =>
                setEditedData((prev) => ({
                  ...prev,
                  surgeryCount: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">입원 횟수</label>
            <input
              type="number"
              min="0"
              value={editedData.hospitalizationCount ?? 0}
              onChange={(e) =>
                setEditedData((prev) => ({
                  ...prev,
                  hospitalizationCount: parseInt(e.target.value) || 0,
                }))
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
              value={editedData.lastDiroDate ?? ""}
              onChange={(e) =>
                setEditedData((prev) => ({
                  ...prev,
                  lastDiroDate: e.target.value,
                }))
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">
              마지막 방문일 (자동 계산)
            </label>
            <input
              type="date"
              value={editedData.lastVisitDate ?? ""}
              readOnly
              className="w-full bg-gray-100 p-3 rounded-lg mt-1 border border-gray-200 cursor-not-allowed"
              title="진료 기록에서 자동으로 계산됩니다"
            />
            <p className="text-xs text-gray-500 mt-1">
              * 가장 최근 진료 날짜가 자동으로 설정됩니다
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-gray-500 text-sm">특이사항</label>
          <textarea
            value={editedData.specialNote ?? ""}
            onChange={(e) =>
              setEditedData((prev) => ({
                ...prev,
                specialNote: e.target.value,
              }))
            }
            className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
          />
        </div>

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
