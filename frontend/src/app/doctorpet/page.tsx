"use client";

import { Search, Plus } from "lucide-react";
import { useState } from "react";
import PetDetailModal from "@/components/doctorpetchange/page";

// PetFormData 타입 정의
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

// Pet 인터페이스 추가
export interface Pet {
  id: number;
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
}

const DoctorPetManagement = () => {
  // 전체 선택 상태와 개별 체크박스 상태 관리
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // selectedPet 타입 지정
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // petData 타입 지정
  const petData: Pet[] = [
    {
      id: 1,
      name: "마이콜",
      type: "강아지", // 추가된 필드
      breed: "말티즈",
      age: "3세",
      gender: "수컷",
      weight: "3.5kg",
      neutered: "완료",
      owner: "김우치",
      treatment: "정기진료",
      lastTreatment: "혈액검사 완료",
      doctor: "김의사",
      diagnosis: "",
      prescription: "",
      neuteredDate: "",
      isDead: false,
      deathDate: "",
      surgeryCount: 0,
      hospitalizationCount: 0,
      lastHeartWormDate: "",
      lastVisitDate: "",
      specialNote: "",
    },
    // ... 더 많은 데이터
  ];

  // 전체 선택 핸들러
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectAll(e.target.checked);
    setSelectedItems(e.target.checked ? petData.map((pet) => pet.id) : []);
  };

  // 개별 체크박스 핸들러
  const handleSelectOne = (id: number) => {
    setSelectedItems((prev) => {
      const newSelected = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      setSelectAll(newSelected.length === petData.length);
      return newSelected;
    });
  };

  // handleEditClick 타입 지정
  const handleEditClick = (pet: Pet) => {
    setSelectedPet(pet);
    setIsModalOpen(true);
  };

  const handleSavePetData = (updatedData: Pet | PetFormData) => {
    // API 호출 또는 상태 업데이트 로직
    console.log("Updated data:", updatedData);
    if (selectedPet) {
      // 기존 데이터 업데이트 로직
      console.log("Updating existing pet:", updatedData);
    } else {
      // 새 데이터 생성 로직
      console.log("Creating new pet:", updatedData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 상단 통계 카드 섹션 */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-teal-500">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                🐾
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm">전체 반려동물</p>
              <h3 className="text-xl font-bold">156</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-blue-500">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                🔍
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm">신규 등록 (이번 주)</p>
              <h3 className="text-xl font-bold">18</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-purple-500">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                💉
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm">당일 내 진료</p>
              <h3 className="text-xl font-bold">52</h3>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 섹션 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="반려동물/보호자/품종 검색"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          <div className="flex gap-2">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                selectedItems.length > 0
                  ? "bg-red-500 text-white hover:bg-red-600 border-red-500"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
              }`}
              disabled={selectedItems.length === 0}
            >
              <i className="fas fa-trash"></i>
              선택 삭제 ({selectedItems.length})
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                />
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                이름
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                종류
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                품종
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                나이
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                성별
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                체중
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                중성화
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                보호자
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                진료
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                마지막 진료
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                담당의
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                편집
              </th>
            </tr>
          </thead>
          <tbody>
            {petData.map((pet) => (
              <tr
                key={pet.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(pet.id)}
                    onChange={() => handleSelectOne(pet.id)}
                    className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                  />
                </td>
                <td className="py-3 px-4">{pet.name}</td>
                <td className="py-3 px-4">{pet.type}</td>
                <td className="py-3 px-4">{pet.breed}</td>
                <td className="py-3 px-4">{pet.age}</td>
                <td className="py-3 px-4">{pet.gender}</td>
                <td className="py-3 px-4">{pet.weight}</td>
                <td className="py-3 px-4">{pet.neutered}</td>
                <td className="py-3 px-4">{pet.owner}</td>
                <td className="py-3 px-4">{pet.treatment}</td>
                <td className="py-3 px-4">{pet.lastTreatment}</td>
                <td className="py-3 px-4">{pet.doctor}</td>
                <td className="py-3 px-4">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => handleEditClick(pet)}
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">
            이전
          </button>
          <button className="px-3 py-1 bg-teal-500 text-white rounded">
            1
          </button>
          <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">
            3
          </button>
          <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">
            다음
          </button>
        </div>
      </div>

      {/* 모달 컴포넌트 */}
      <PetDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        petData={
          selectedPet || {
            id: 0,
            name: "",
            type: "",
            breed: "",
            age: "",
            gender: "",
            weight: "",
            neutered: "",
            neuteredDate: "",
            isDead: false,
            deathDate: "",
            surgeryCount: 0,
            hospitalizationCount: 0,
            lastHeartWormDate: "",
            lastVisitDate: "",
            specialNote: "",
            owner: "",
            treatment: "",
            lastTreatment: "",
            doctor: "",
            diagnosis: "",
            prescription: "",
          }
        }
        onSave={handleSavePetData}
      />
    </div>
  );
};

export default DoctorPetManagement;
