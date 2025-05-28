"use client";

import React, { useState, useEffect } from "react";
import { Search, Eye, Calendar, Syringe } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// VaccinationStatus enum
enum VaccinationStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

// OwnerPetVaccineDTO 인터페이스
interface OwnerPetVaccineDTO {
  vaccinationId: number;
  petName: string;
  vaccineName: string;
  currentDose: number;
  totalDoses: number;
  vaccinationDate: string;
  nextDueDate: string | null;
  status: VaccinationStatus;
  notes: string | null;
}

const OwnerPetVaccineView: React.FC = () => {
  const [vaccines, setVaccines] = useState<OwnerPetVaccineDTO[]>([]);
  const [filteredVaccines, setFilteredVaccines] = useState<
    OwnerPetVaccineDTO[]
  >([]);
  const [selectedVaccine, setSelectedVaccine] =
    useState<OwnerPetVaccineDTO | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const { user } = useUser();

  // 전체 조회
  const fetchAllVaccines = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/owner/vaccines`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("백신 기록을 불러오는데 실패했습니다");
      }

      const data = await response.json();
      console.log("Fetched vaccines:", data);
      setVaccines(data);
      setFilteredVaccines(data);
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      setError("백신 기록을 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // 상세 조회
  const fetchVaccineDetail = async (vaccinationId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/owner/vaccines/${vaccinationId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("백신 상세 정보를 불러오는데 실패했습니다");
      }

      const data = await response.json();
      console.log("Fetched vaccine detail:", data);
      setSelectedVaccine(data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Error fetching vaccine detail:", error);
      alert("백신 상세 정보를 불러오는데 실패했습니다");
    }
  };

  // 검색 기능
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term === "") {
      setFilteredVaccines(vaccines);
    } else {
      const filtered = vaccines.filter(
        (vaccine) =>
          vaccine.petName.toLowerCase().includes(term.toLowerCase()) ||
          vaccine.vaccineName.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredVaccines(filtered);
    }
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      return `${year}. ${month}. ${day}.`;
    } catch (error) {
      return "-";
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
        return "-";
    }
  };

  // 접종 상태 색상
  const getStatusColor = (status: VaccinationStatus) => {
    switch (status) {
      case VaccinationStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case VaccinationStatus.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800";
      case VaccinationStatus.NOT_STARTED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 페이지네이션 계산
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredVaccines.slice(startIndex, endIndex);
  };

  // 전체 페이지 수 계산
  useEffect(() => {
    setTotalPages(Math.ceil(filteredVaccines.length / itemsPerPage));
  }, [filteredVaccines]);

  // 페이지 번호 생성
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (user?.id) {
      fetchAllVaccines();
    }
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-500">백신 기록을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Syringe className="text-teal-500" size={28} />
              우리 아이 백신 기록
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              반려동물의 예방접종 기록을 확인하세요
            </p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="반려동물/백신이름 검색"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="mb-4 text-sm text-gray-600">
          총 {filteredVaccines.length}개의 백신 기록
        </div>

        {/* 백신 기록 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  반려동물
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  백신명
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  접종 회차
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  접종일
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  다음 접종일
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  접종 상태
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  상세보기
                </th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData().map((vaccine) => (
                <tr
                  key={vaccine.vaccinationId}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {vaccine.petName}
                  </td>
                  <td className="py-3 px-4">{vaccine.vaccineName}</td>
                  <td className="py-3 px-4">
                    {vaccine.currentDose}/{vaccine.totalDoses}
                  </td>
                  <td className="py-3 px-4">
                    {formatDate(vaccine.vaccinationDate)}
                  </td>
                  <td className="py-3 px-4">
                    {formatDate(vaccine.nextDueDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        vaccine.status
                      )}`}
                    >
                      {getStatusText(vaccine.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => fetchVaccineDetail(vaccine.vaccinationId)}
                      className="text-teal-500 hover:text-teal-700 flex items-center gap-1"
                    >
                      <Eye size={16} />
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 데이터가 없을 때 */}
        {filteredVaccines.length === 0 && (
          <div className="text-center py-12">
            <Syringe className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">백신 기록이 없습니다.</p>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
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
              className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 상세보기 모달 */}
      {isDetailModalOpen && selectedVaccine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Syringe className="text-teal-500" size={24} />
                백신 접종 상세 정보
              </h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* 기본 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">기본 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">반려동물:</span>
                    <p className="font-medium">{selectedVaccine.petName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">백신명:</span>
                    <p className="font-medium">{selectedVaccine.vaccineName}</p>
                  </div>
                </div>
              </div>

              {/* 접종 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">접종 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">접종 회차:</span>
                    <p className="font-medium">
                      {selectedVaccine.currentDose}/{selectedVaccine.totalDoses}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">접종 상태:</span>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(
                        selectedVaccine.status
                      )}`}
                    >
                      {getStatusText(selectedVaccine.status)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">접종일:</span>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar size={16} className="text-gray-400" />
                      {formatDate(selectedVaccine.vaccinationDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">다음 접종일:</span>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar size={16} className="text-gray-400" />
                      {formatDate(selectedVaccine.nextDueDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 메모 */}
              {selectedVaccine.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">메모</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedVaccine.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerPetVaccineView;
