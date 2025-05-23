"use client";

import { Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import PetDetailModal from "@/components/doctorpetchange/DoctorChange";

// Gender enum 추가
enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

// Pet 인터페이스 수정
export interface Pet {
  id: number;
  name: string;
  gender: Gender;
  species: string;
  breed: string;
  birth: string;
  weight: number;
  isNeutered: boolean;
  neuteredDate: string | null;
  isDeceased: boolean;
  deceasedDate: string | null;
  surgeryCount: number;
  hospitalizationCount: number;
  lastDiroDate: string | null;
  lastVisitDate: string | null;
  profileUrl: string | null;
  specialNote: string;
  owner: {
    id: number;
    name: string;
  };
}

const DoctorPetManagement = () => {
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [pets, setPets] = useState<Pet[]>([]); // 반려동물 목록 상태 추가
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10; // 페이지당 표시할 항목 수
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태 추가

  // 전체 반려동물 조회 수정
  useEffect(() => {
    const fetchPets = async () => {
      try {
        console.log("Fetching pets..."); // 디버깅용 로그
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctor/pets`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
          }
        );

        console.log("Response status:", response.status); // 디버깅용 로그

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText); // 디버깅용 로그
          throw new Error(`Failed to fetch pets: ${errorText}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data);

        // 데이터 형식 확인 및 변환
        const formattedPets = Array.isArray(data) ? data : data.content || [];
        // owner 속성이 없는 경우 기본값 추가
        const petsWithDefaults = formattedPets.map((pet: Partial<Pet>) => ({
          ...pet,
          owner: pet.owner || { id: 0, name: "정보 없음" },
        }));
        setPets(petsWithDefaults as Pet[]);
      } catch (error) {
        console.error("Error fetching pets:", error);
        setError("반려동물 데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, []);

  // 디버깅용 로그 추가
  useEffect(() => {
    console.log("Current pets state:", pets);
  }, [pets]);

  // 반려동물 상세 조회
  const fetchPetDetail = async (petId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctor/pets/${petId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pet detail");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching pet detail:", error);
      throw error;
    }
  };

  // handleEditClick 수정
  const handleEditClick = async (pet: Pet) => {
    try {
      const petDetail = await fetchPetDetail(pet.id);
      setSelectedPet(petDetail);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error in handleEditClick:", error);
    }
  };

  // handleSavePetData 함수 수정
  const handleSavePetData = async (updatedData: Pet): Promise<void> => {
    try {
      if (selectedPet) {
        console.log("Updating pet data:", updatedData); // 디버깅용 로그

        // DoctorPetRequestDTO 형식에 맞게 데이터 변환 및 기본값 설정
        const requestData = {
          name: updatedData.name,
          gender: updatedData.gender,
          species: updatedData.species,
          breed: updatedData.breed,
          birth: updatedData.birth,
          weight: updatedData.weight,
          isNeutered: updatedData.isNeutered || false, // 기본값 설정
          neuteredDate: updatedData.neuteredDate,
          isDeceased: updatedData.isDeceased || false, // 기본값 설정
          deceasedDate: updatedData.deceasedDate,
          surgeryCount: updatedData.surgeryCount || 0, // 기본값 설정
          hospitalizationCount: updatedData.hospitalizationCount || 0, // 기본값 설정
          lastDiroDate: updatedData.lastDiroDate,
          lastVisitDate: updatedData.lastVisitDate,
          specialNote: updatedData.specialNote || "", // 기본값 설정
        };

        // 요청 전 데이터 확인
        console.log("Request data:", requestData);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctor/pets/${selectedPet.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(requestData),
          }
        );

        console.log("Response status:", response.status); // 디버깅용 로그

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText); // 디버깅용 로그
          throw new Error(errorText || "Failed to update pet data");
        }

        const updatedPetData = await response.json();
        console.log("Updated pet data:", updatedPetData); // 디버깅용 로그

        // 목록 업데이트
        setPets((prevPets) =>
          prevPets.map((pet) =>
            pet.id === selectedPet.id ? { ...pet, ...updatedPetData } : pet
          )
        );

        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error saving pet data:", error);
      throw error;
    }
  };

  // handleSelectAll 함수 추가
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectAll(e.target.checked);
    setSelectedItems(e.target.checked ? pets.map((pet) => pet.id) : []);
  };

  // handleSelectOne 함수 추가
  const handleSelectOne = (id: number) => {
    setSelectedItems((prev) => {
      const newSelected = prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id];
      setSelectAll(newSelected.length === pets.length);
      return newSelected;
    });
  };

  // 검색된 데이터 필터링 함수
  const getFilteredData = () => {
    return pets.filter((pet) =>
      [pet.name, pet.owner.name, pet.breed, pet.species]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  };

  // 페이지네이션된 데이터 계산 수정
  const getPaginatedData = () => {
    const filteredData = getFilteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  // 전체 페이지 수 계산 수정
  useEffect(() => {
    const filteredData = getFilteredData();
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  }, [pets, searchTerm]);

  // 검색어 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 페이지 변경 핸들러 추가
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 페이지 번호 배열 생성 함수 추가
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  // 반려동물 삭제 함수 추가
  const handleDeleteSelected = async () => {
    if (
      !window.confirm(
        `선택한 ${selectedItems.length}개의 항목을 삭제하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      // 선택된 모든 항목에 대해 삭제 요청
      const deletePromises = selectedItems.map(async (petId) => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctor/pets/${petId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete pet ${petId}`);
        }
      });

      await Promise.all(deletePromises);

      // 삭제 성공 후 상태 업데이트
      setPets((prevPets) =>
        prevPets.filter((pet) => !selectedItems.includes(pet.id))
      );
      setSelectedItems([]);
      setSelectAll(false);
      alert("선택한 항목이 삭제되었습니다.");
    } catch (error) {
      console.error("Delete error:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-500">데이터를 불러오는 중...</div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 검색 및 필터 섹션 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="반려동물/보호자/품종 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              onClick={handleDeleteSelected}
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
                종
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                품종
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                생년월일
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                성별
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                체중
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                중성화여부
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                보호자
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                마지막방문일
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                편집
              </th>
            </tr>
          </thead>
          <tbody>
            {getPaginatedData().map((pet: Pet) => (
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
                <td className="py-3 px-4">{pet.species}</td>
                <td className="py-3 px-4">{pet.breed}</td>
                <td className="py-3 px-4">{pet.birth}</td>
                <td className="py-3 px-4">
                  {pet.gender === Gender.MALE ? "수컷" : "암컷"}
                </td>
                <td className="py-3 px-4">{pet.weight}kg</td>
                <td className="py-3 px-4">
                  {pet.isNeutered ? "완료" : "미완료"}
                </td>
                <td className="py-3 px-4">{pet.owner?.name || "정보 없음"}</td>
                <td className="py-3 px-4">{pet.lastVisitDate || "-"}</td>
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
          <button
            className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            이전
          </button>

          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              className={`px-3 py-1 rounded ${
                currentPage === pageNum
                  ? "bg-teal-500 text-white"
                  : "border border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </button>
          ))}

          <button
            className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      </div>

      {/* 모달 컴포넌트 수정 */}
      <PetDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        petData={
          selectedPet || {
            id: 0,
            name: "",
            gender: Gender.MALE,
            species: "",
            breed: "",
            birth: "",
            weight: 0,
            isNeutered: false,
            neuteredDate: null,
            isDeceased: false,
            deceasedDate: null,
            surgeryCount: 0,
            hospitalizationCount: 0,
            lastDiroDate: null,
            lastVisitDate: null,
            profileUrl: null,
            specialNote: "",
            owner: {
              id: 0,
              name: "",
            },
          }
        }
        onSave={handleSavePetData}
      />
    </div>
  );
};

export default DoctorPetManagement;
