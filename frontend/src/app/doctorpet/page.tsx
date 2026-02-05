"use client";

import { Search, Eye, Trash2, Edit, Mars, Venus } from "lucide-react";
import { useState, useEffect } from "react";
import PetDetailModal from "@/components/doctorpetchange/DoctorChange";
import { toast } from "react-hot-toast";

// Gender enum 추가
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

// Pet 인터페이스 export (다른 컴포넌트에서 import 가능하도록)
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
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");

  // 날짜 포맷 함수 개선
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";

    try {
      // ISO 문자열인 경우 처리
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";

      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "-";
    }
  };

  // 전체 반려동물 조회 수정 - 백엔드에서 자동 계산된 lastVisitDate 수신
  useEffect(() => {
    const fetchPets = async () => {
      try {
        console.log("Fetching pets...");
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

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch pets: ${errorText}`);
        }

        const data = await response.json();
        console.log("Raw API response:", data);

        // 타입 명시적 선언으로 오류 해결
        const formattedPets: any[] = Array.isArray(data)
          ? data
          : data.content || [];

        const petsWithDefaults: Pet[] = formattedPets.map((pet: any) => {
          console.log(`Processing Pet ${pet.name}:`);
          console.log(`- Backend calculated lastVisitDate:`, pet.lastVisitDate);
          console.log(
            `- Raw isNeutered:`,
            pet.isNeutered,
            typeof pet.isNeutered
          );

          // 강력한 boolean 변환
          const isNeutered =
            pet.isNeutered === true ||
            pet.isNeutered === "true" ||
            pet.isNeutered === 1 ||
            pet.isNeutered === "1";

          const isDeceased =
            pet.isDeceased === true ||
            pet.isDeceased === "true" ||
            pet.isDeceased === 1 ||
            pet.isDeceased === "1";

          // 날짜 필드 처리 - 백엔드에서 계산된 값 그대로 사용
          const lastVisitDate =
            pet.lastVisitDate && pet.lastVisitDate !== ""
              ? pet.lastVisitDate
              : null;
          const lastDiroDate =
            pet.lastDiroDate && pet.lastDiroDate !== ""
              ? pet.lastDiroDate
              : null;
          const neuteredDate =
            pet.neuteredDate && pet.neuteredDate !== ""
              ? pet.neuteredDate
              : null;
          const deceasedDate =
            pet.deceasedDate && pet.deceasedDate !== ""
              ? pet.deceasedDate
              : null;

          return {
            id: pet.id,
            name: pet.name || "",
            gender: pet.gender || Gender.MALE,
            species: pet.species || "",
            breed: pet.breed || "",
            birth: pet.birth || "",
            weight: pet.weight || 0,
            isNeutered: isNeutered,
            neuteredDate: neuteredDate,
            isDeceased: isDeceased,
            deceasedDate: deceasedDate,
            surgeryCount: pet.surgeryCount || 0,
            hospitalizationCount: pet.hospitalizationCount || 0,
            lastDiroDate: lastDiroDate,
            lastVisitDate: lastVisitDate, // 백엔드에서 자동 계산된 값
            profileUrl: pet.profileUrl || null,
            specialNote: pet.specialNote || "",
            owner: pet.owner || { id: 0, name: "정보 없음" },
          };
        });

        console.log(
          "Final formatted pets with backend calculated lastVisitDate:",
          petsWithDefaults.map((p: Pet) => ({
            name: p.name,
            lastVisitDate: p.lastVisitDate,
            isNeutered: p.isNeutered,
          }))
        );

        setPets(petsWithDefaults);
      } catch (error) {
        console.error("Error fetching pets:", error);
        setError("반려동물 데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, []);

  // 반려동물 상세 조회 - 백엔드에서 자동 계산된 데이터 수신
  const fetchPetDetail = async (petId: number): Promise<Pet> => {
    try {
      console.log(`Fetching detail for pet ID: ${petId}`);
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
      console.log("Raw pet detail data:", data);
      console.log("Backend calculated lastVisitDate:", data.lastVisitDate);

      // 강력한 boolean 변환
      const isNeutered =
        data.isNeutered === true ||
        data.isNeutered === "true" ||
        data.isNeutered === 1 ||
        data.isNeutered === "1";

      const isDeceased =
        data.isDeceased === true ||
        data.isDeceased === "true" ||
        data.isDeceased === 1 ||
        data.isDeceased === "1";

      // 날짜 필드 처리 - 백엔드에서 계산된 값 그대로 사용
      const lastVisitDate =
        data.lastVisitDate && data.lastVisitDate !== ""
          ? data.lastVisitDate
          : null;
      const lastDiroDate =
        data.lastDiroDate && data.lastDiroDate !== ""
          ? data.lastDiroDate
          : null;
      const neuteredDate =
        data.neuteredDate && data.neuteredDate !== ""
          ? data.neuteredDate
          : null;
      const deceasedDate =
        data.deceasedDate && data.deceasedDate !== ""
          ? data.deceasedDate
          : null;

      const formattedData: Pet = {
        ...data,
        isNeutered: isNeutered,
        isDeceased: isDeceased,
        lastVisitDate: lastVisitDate, // 백엔드에서 자동 계산된 값
        lastDiroDate: lastDiroDate,
        neuteredDate: neuteredDate,
        deceasedDate: deceasedDate,
        owner: data.owner || { id: 0, name: "정보 없음" },
      };

      console.log(
        "Formatted pet detail with backend calculated lastVisitDate:",
        formattedData
      );

      return formattedData;
    } catch (error) {
      console.error("Error fetching pet detail:", error);
      throw error;
    }
  };

  // handleEditClick 수정
  const handleEditClick = async (pet: Pet) => {
    try {
      console.log(
        "Opening edit modal for pet:",
        pet.name,
        "lastVisitDate:",
        pet.lastVisitDate
      );
      const petDetail = await fetchPetDetail(pet.id);
      setSelectedPet(petDetail);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error in handleEditClick:", error);
    }
  };

  // handleSavePetData 함수 수정 - 타입 시그니처 명시적 정의
  const handleSavePetData: (data: Pet) => Promise<void> = async (
    updatedData: Pet
  ) => {
    try {
      if (selectedPet) {
        console.log("Saving pet data:", updatedData);

        const requestData = {
          name: updatedData.name,
          gender: updatedData.gender,
          species: updatedData.species,
          breed: updatedData.breed,
          birth: updatedData.birth,
          weight: updatedData.weight,
          isNeutered: updatedData.isNeutered === true,
          neuteredDate: updatedData.neuteredDate,
          isDeceased: updatedData.isDeceased === true,
          deceasedDate: updatedData.deceasedDate,
          surgeryCount: updatedData.surgeryCount || 0,
          hospitalizationCount: updatedData.hospitalizationCount || 0,
          lastDiroDate: updatedData.lastDiroDate,
          // lastVisitDate는 백엔드에서 자동 계산하므로 전송하지 않음
          specialNote: updatedData.specialNote || "",
        };

        console.log(
          "Request data being sent to server (without lastVisitDate):",
          requestData
        );

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

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to update pet data");
        }

        const updatedPetData = await response.json();
        console.log("Response from server:", updatedPetData);
        console.log(
          "Backend calculated lastVisitDate:",
          updatedPetData.lastVisitDate
        );

        // 서버 응답 데이터의 boolean 값 강력 변환
        const serverIsNeutered =
          updatedPetData.isNeutered === true ||
          updatedPetData.isNeutered === "true" ||
          updatedPetData.isNeutered === 1 ||
          updatedPetData.isNeutered === "1";

        const serverIsDeceased =
          updatedPetData.isDeceased === true ||
          updatedPetData.isDeceased === "true" ||
          updatedPetData.isDeceased === 1 ||
          updatedPetData.isDeceased === "1";

        // 완전히 새로운 객체로 상태 업데이트
        const newPetData: Pet = {
          id: selectedPet.id,
          name: updatedData.name,
          gender: updatedData.gender,
          species: updatedData.species,
          breed: updatedData.breed,
          birth: updatedData.birth,
          weight: updatedData.weight,
          isNeutered: serverIsNeutered,
          neuteredDate: updatedData.neuteredDate,
          isDeceased: serverIsDeceased,
          deceasedDate: updatedData.deceasedDate,
          surgeryCount: updatedData.surgeryCount || 0,
          hospitalizationCount: updatedData.hospitalizationCount || 0,
          lastDiroDate: updatedData.lastDiroDate,
          // 백엔드에서 계산된 lastVisitDate 사용
          lastVisitDate: updatedPetData.lastVisitDate || null,
          profileUrl: selectedPet.profileUrl,
          specialNote: updatedData.specialNote || "",
          owner: selectedPet.owner,
        };

        console.log(
          "New pet data with backend calculated lastVisitDate:",
          newPetData
        );

        // 상태 업데이트
        setPets((prevPets: Pet[]) =>
          prevPets.map((pet: Pet) =>
            pet.id === selectedPet.id ? newPetData : pet
          )
        );

        setSelectedPet(newPetData);
        setIsModalOpen(false);
        console.log(
          "Pet data updated successfully with backend calculated lastVisitDate"
        );
      }
    } catch (error) {
      console.error("Error saving pet data:", error);
      throw error;
    }
  };

  // handleSelectAll 함수 추가
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectAll(e.target.checked);
    setSelectedItems(e.target.checked ? pets.map((pet: Pet) => pet.id) : []);
  };

  // handleSelectOne 함수 추가
  const handleSelectOne = (id: number) => {
    setSelectedItems((prev: number[]) => {
      const newSelected = prev.includes(id)
        ? prev.filter((itemId: number) => itemId !== id)
        : [...prev, id];
      setSelectAll(newSelected.length === pets.length);
      return newSelected;
    });
  };

  // 검색된 데이터 필터링 함수
  const getFilteredData = (): Pet[] => {
    return pets.filter((pet: Pet) =>
      [pet.name, pet.owner.name, pet.breed, pet.species]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  };

  // 페이지네이션된 데이터 계산 수정
  const getPaginatedData = (): Pet[] => {
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
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
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
      const deletePromises = selectedItems.map(async (petId: number) => {
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

      setPets((prevPets: Pet[]) =>
        prevPets.filter((pet: Pet) => !selectedItems.includes(pet.id))
      );
      setSelectedItems([]);
      setSelectAll(false);
      toast.success("선택한 항목이 삭제되었습니다.");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("삭제 중 오류가 발생했습니다.");
    }
  };

  // 기본 Pet 데이터 정의
  const defaultPetData: Pet = {
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
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <div className="text-gray-500">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">오류 발생</div>
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-sm px-2 py-5">
        {/* 검색 및 필터 섹션 */}
        <div className="flex justify-between items-center mb-4">
          {/* 검색 영역 */}
          <div className="relative">
            <input
              type="text"
              placeholder="반려동물/보호자/품종 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8 pl-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
            />
            <Search
              size={16}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* 액션 버튼 영역 */}
          <div className="flex gap-2">
            <button
              className={`flex items-center gap-1 text-sm px-3 py-1 rounded-md transition ${
                selectedItems.length > 0
                  ? "text-white bg-[#49BEB7] hover:bg-[#3ea9a2]"
                  : "text-gray-400 bg-gray-100 cursor-not-allowed"
              }`}
              disabled={selectedItems.length === 0}
              onClick={handleDeleteSelected}
            >
              <Trash2 size={16} /> 선택 삭제 ({selectedItems.length})
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-hidden rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#49BEB7] focus:ring-[#49BEB7]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  이름
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  종
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  품종
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  생년월일
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  성별
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  체중
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  중성화여부
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  보호자
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  마지막방문일
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getPaginatedData().length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-4 text-gray-500">
                    {searchTerm
                      ? "검색 결과가 없습니다."
                      : "등록된 반려동물이 없습니다."}
                  </td>
                </tr>
              ) : (
                getPaginatedData().map((pet: Pet) => (
                  <tr key={pet.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(pet.id)}
                        onChange={() => handleSelectOne(pet.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#49BEB7] focus:ring-[#49BEB7]"
                      />
                    </td>
                    <td className="px-4 py-4 text-sm text-[#49BEB7] font-medium">
                      {pet.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {pet.species}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {pet.breed}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatDate(pet.birth)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex text-xs px-2 py-1 rounded-full ${
                          pet.gender === Gender.MALE
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                        }`}
                      >
                        {pet.gender === Gender.MALE ? (
                          <Mars size={16} />
                        ) : (
                          <Venus size={16} />
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {pet.weight}kg
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex text-xs px-2 py-1 rounded-full ${
                          pet.isNeutered
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {pet.isNeutered ? "완료" : "미완료"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {pet.owner?.name || "정보 없음"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {pet.lastVisitDate ? formatDate(pet.lastVisitDate) : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleEditClick(pet)}
                        className="flex items-center gap-1 text-sm px-3 py-1 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                      >
                        <Edit size={16} /> 편집
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              이전
            </button>

            {getPageNumbers().map((pageNum: number) => (
              <button
                key={pageNum}
                className={`px-3 py-1 rounded-md ${
                  currentPage === pageNum
                    ? "bg-[#49BEB7] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 모달 컴포넌트 */}
      <PetDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        petData={selectedPet || defaultPetData}
        onSave={handleSavePetData}
      />
    </div>
  );
};

export default DoctorPetManagement;
