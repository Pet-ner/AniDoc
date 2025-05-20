import React, { useState, useEffect } from "react";
import { Pet } from "@/app/doctorpet/page";

type PetFormData = {
  id?: number;
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  weight: string;
  neutered: string;
  neuteredDate: string;
  isDead: boolean;
  deathDate: string;
  surgeryCount: number;
  hospitalizationCount: number;
  lastHeartWormDate: string;
  lastVisitDate: string;
  specialNote: string;
  owner: string;
  treatment: string;
  lastTreatment: string;
  doctor: string;
  diagnosis: string;
  prescription: string;
};

interface PetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  petData: Pet | PetFormData;
  onSave: (updatedData: Pet | PetFormData) => void;
}

const PetDetailModal: React.FC<PetDetailModalProps> = ({
  isOpen,
  onClose,
  petData,
  onSave,
}) => {
  const [editedData, setEditedData] = useState(petData);

  useEffect(() => {
    setEditedData(petData);
  }, [petData]);

  const handleChange = (
    field: keyof PetFormData,
    value: string | boolean | number
  ) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSave?.(editedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] p-6">
        {" "}
        {/* 너비 증가 */}
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">반려동물 상세 정보</h2>
        </div>
        {/* 기본 정보 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {" "}
          {/* grid-cols-3으로 변경 */}
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
            <label className="text-gray-500 text-sm">종류</label>
            <input
              type="text"
              value={editedData.type}
              onChange={(e) => handleChange("type", e.target.value)}
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
            <label className="text-gray-500 text-sm">나이</label>
            <input
              type="text"
              value={editedData.age}
              onChange={(e) => handleChange("age", e.target.value)}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-gray-500 text-sm">성별</label>
            <select
              value={editedData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="수컷">수컷</option>
              <option value="암컷">암컷</option>
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-sm">체중</label>
            <input
              type="text"
              value={editedData.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-gray-500 text-sm">중성화</label>
            <select
              value={editedData.neutered}
              onChange={(e) => handleChange("neutered", e.target.value)}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="완료">완료</option>
              <option value="미완료">미완료</option>
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-sm">중성화 날짜</label>
            <input
              type="date"
              value={editedData.neuteredDate}
              onChange={(e) => handleChange("neuteredDate", e.target.value)}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-gray-500 text-sm">사망여부</label>
            <select
              value={editedData.isDead ? "true" : "false"}
              onChange={(e) => handleChange("isDead", e.target.value)}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="false">생존</option>
              <option value="true">사망</option>
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-sm">사망날짜</label>
            <input
              type="date"
              value={editedData.deathDate}
              onChange={(e) => handleChange("deathDate", e.target.value)}
              disabled={!editedData.isDead}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-gray-500 text-sm">수술횟수</label>
            <input
              type="number"
              min="0"
              step="1"
              value={editedData.surgeryCount}
              onChange={(e) =>
                handleChange(
                  "surgeryCount",
                  Math.max(0, parseInt(e.target.value) || 0)
                )
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-gray-500 text-sm">입원횟수</label>
            <input
              type="number"
              min="0"
              step="1"
              value={editedData.hospitalizationCount}
              onChange={(e) =>
                handleChange(
                  "hospitalizationCount",
                  Math.max(0, parseInt(e.target.value) || 0)
                )
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
              value={editedData.lastHeartWormDate}
              onChange={(e) =>
                handleChange("lastHeartWormDate", e.target.value)
              }
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-gray-500 text-sm">마지막 방문일</label>
            <input
              type="date"
              value={editedData.lastVisitDate}
              onChange={(e) => handleChange("lastVisitDate", e.target.value)}
              className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        {/* 특이사항 */}
        <div className="mb-6">
          <label className="text-gray-500 text-sm">특이사항</label>
          <textarea
            value={editedData.specialNote}
            onChange={(e) => handleChange("specialNote", e.target.value)}
            className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
          />
        </div>
        {/* 진단 내용 */}
        <div className="mb-6">
          <label className="text-gray-500 text-sm">진단 내용</label>
          <textarea
            value={editedData.diagnosis}
            onChange={(e) => handleChange("diagnosis", e.target.value)}
            className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
          />
        </div>
        {/* 처방 내용 */}
        <div className="mb-6">
          <label className="text-gray-500 text-sm">처방 내용</label>
          <textarea
            value={editedData.prescription}
            onChange={(e) => handleChange("prescription", e.target.value)}
            className="w-full bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
          />
        </div>
        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetDetailModal;
