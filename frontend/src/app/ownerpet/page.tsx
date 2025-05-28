"use client";

import { useState, useEffect } from "react";
import Pet from "@/components/pet/PetRegist";
import OwnerPetVaccineView from "@/components/ownerpetvaccine/OwnerPetVaccineView";
import { useUser } from "@/contexts/UserContext";

interface Pet {
  id: number;
  name: string;
  birth: string;
  gender: string;
  species: string;
  breed: string;
  weight: number;
  isNeutered: boolean;
  profileUrl?: string;
  lastDiroDate?: string;
}

interface Notice {
  id: number;
  title: string;
  date: string;
}

// 백신 기록 인터페이스 추가
interface VaccineRecord {
  vaccinationId: number;
  petName: string;
  vaccineName: string;
  currentDose: number;
  totalDoses: number;
  vaccinationDate: string;
  nextDueDate: string | null;
  status: string;
  notes: string | null;
}

const PetManagement = () => {
  const { user } = useUser();
  const [showPetModal, setShowPetModal] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);

  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const petsPerPage = 6; // 페이지당 반려동물 수

  // 백신 기록 모달 상태 추가
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [selectedPetForVaccine, setSelectedPetForVaccine] =
    useState<Pet | null>(null);
  const [vaccineRecords, setVaccineRecords] = useState<VaccineRecord[]>([]);
  const [vaccineLoading, setVaccineLoading] = useState(false);

  // 백신 기록 페이지네이션 상태 추가
  const [vaccineCurrentPage, setVaccineCurrentPage] = useState(1);
  const vaccineRecordsPerPage = 3; // 페이지당 백신 기록 수 (3개로 변경)

  // 전체 조회
  const fetchPets = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        throw new Error("사용자 정보가 없습니다.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pets?ownerId=${user.id}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("반려동물 목록을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      console.log("반려동물 목록:", JSON.stringify(data, null, 2));
      setPets(data);
      // 새로운 반려동물이 추가되면 첫 페이지로 이동
      setCurrentPage(1);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      alert("반려동물 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 상세 조회
  const fetchPetDetail = async (petId: number) => {
    console.log("fetchPetDetail 호출, petId:", petId);
    try {
      if (!user?.id) {
        throw new Error("사용자 정보가 없습니다.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pets/${petId}?ownerId=${user.id}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("반려동물 정보를 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      const transformedData = {
        ...data,
        birth: data.birth,
        profileUrl: data.profileUrl,
        lastDiroDate: data.lastDiroDate,
        species: data.species,
      };
      setSelectedPet(transformedData);
      setShowPetModal(true);
    } catch (error) {
      console.error("상세 정보 로딩 실패:", error);
      alert("반려동물 정보를 불러오는데 실패했습니다.");
    }
  };

  // 공지사항 조회 함수
  const fetchNotices = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notices`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("공지사항을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setNotices(data);
    } catch (error) {
      console.error("공지사항 로딩 실패:", error);
    }
  };

  // 반려동물 삭제 함수 추가
  const handleDeletePet = async (petId: number) => {
    if (!window.confirm("정말로 이 반려동물을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pets/${petId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("반려동물 삭제에 실패했습니다.");
      }

      // 삭제 성공 시 목록 새로고침
      fetchPets();
      alert("반려동물이 삭제되었습니다.");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("반려동물 삭제에 실패했습니다.");
    }
  };

  // 예방접종 조회 함수 - 실제 API 연결
  const handleViewVaccination = async (pet: Pet) => {
    try {
      setVaccineLoading(true);
      setSelectedPetForVaccine(pet);
      setVaccineCurrentPage(1); // 백신 기록 페이지 초기화

      console.log(`${pet.name}의 예방접종 기록을 조회합니다.`);

      // 보호자의 모든 백신 기록을 가져온 후 해당 반려동물만 필터링
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

      const allVaccines = await response.json();
      console.log("전체 백신 기록:", allVaccines);

      // 선택된 반려동물의 백신 기록만 필터링
      const petVaccines = allVaccines.filter(
        (vaccine: VaccineRecord) => vaccine.petName === pet.name
      );

      console.log(`${pet.name}의 백신 기록:`, petVaccines);
      setVaccineRecords(petVaccines);
      setShowVaccineModal(true);
    } catch (error) {
      console.error("백신 기록 조회 실패:", error);
      alert("백신 기록을 불러오는데 실패했습니다.");
    } finally {
      setVaccineLoading(false);
    }
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
  const getStatusText = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return "미접종";
      case "IN_PROGRESS":
        return "접종진행중";
      case "COMPLETED":
        return "접종완료";
      default:
        return "-";
    }
  };

  // 접종 상태 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "NOT_STARTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 반려동물 페이지네이션 계산
  const totalPages = Math.ceil(pets.length / petsPerPage);
  const startIndex = (currentPage - 1) * petsPerPage;
  const endIndex = startIndex + petsPerPage;
  const currentPets = pets.slice(startIndex, endIndex);

  // 백신 기록 페이지네이션 계산
  const vaccineTotalPages = Math.ceil(
    vaccineRecords.length / vaccineRecordsPerPage
  );
  const vaccineStartIndex = (vaccineCurrentPage - 1) * vaccineRecordsPerPage;
  const vaccineEndIndex = vaccineStartIndex + vaccineRecordsPerPage;
  const currentVaccineRecords = vaccineRecords.slice(
    vaccineStartIndex,
    vaccineEndIndex
  );

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 백신 기록 페이지 변경 핸들러
  const handleVaccinePageChange = (page: number) => {
    setVaccineCurrentPage(page);
  };

  // 페이지 번호 생성
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  // 백신 기록 페이지 번호 생성
  const getVaccinePageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= vaccineTotalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  useEffect(() => {
    if (user?.id) {
      fetchPets();
      fetchNotices();
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <div className="flex gap-6">
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1">
          {/* 반려동물 목록 섹션 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                등록된 반려동물 ({pets.length}마리)
              </h2>
              <button
                onClick={() => {
                  setSelectedPet(null);
                  setShowPetModal(true);
                }}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
              >
                반려동물 추가
              </button>
            </div>

            {/* 반려동물 카드 그리드 */}
            <div className="grid grid-cols-2 gap-6">
              {loading ? (
                <div>로딩 중...</div>
              ) : (
                currentPets.map((pet) => (
                  <div
                    key={pet.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={pet.profileUrl || "/default-pet.jpg"}
                        alt={pet.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">{pet.name}</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {pet.species}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-500">
                        <p>품종: {pet.breed}</p>
                        <p>체중: {pet.weight}kg</p>
                        <p>
                          성별: {pet.gender} (중성화{" "}
                          {pet.isNeutered ? "O" : "X"})
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        {/* 예방접종조회 버튼을 왼쪽으로 이동 */}
                        <button
                          onClick={() => handleViewVaccination(pet)}
                          className="text-green-600 hover:text-green-800 px-3 py-1 rounded"
                          disabled={vaccineLoading}
                        >
                          {vaccineLoading ? "로딩..." : "예방접종조회"}
                        </button>

                        <div className="flex gap-2">
                          {/* 수정 버튼을 가운데로 이동 */}
                          <button
                            onClick={() => fetchPetDetail(pet.id)}
                            className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded"
                          >
                            수정
                          </button>

                          {/* 삭제 버튼은 오른쪽 유지 */}
                          <button
                            onClick={() => handleDeletePet(pet.id)}
                            className="text-red-600 hover:text-red-800 px-3 py-1 rounded"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 반려동물 페이지네이션 - 반려동물이 6개를 넘을 때만 표시 */}
            {pets.length > petsPerPage && (
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
        </div>

        {/* 우측 사이드바 */}
        <div className="w-1/4 space-y-6">
          {/* 최근 알림 */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-[200px]">
            <h2 className="text-xl font-bold mb-4">최근 알림</h2>
            <div className="space-y-3 overflow-y-auto h-[calc(100%-2rem)]">
              <div className="text-sm text-gray-500">
                새로운 알림이 없습니다.
              </div>
            </div>
          </div>

          {/* 공지사항 */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-[200px]">
            <h2 className="text-xl font-bold mb-4">공지사항</h2>
            <div className="space-y-3 overflow-y-auto h-[calc(100%-2rem)]">
              {notices && notices.length > 0 ? (
                notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="flex flex-col gap-1 border-b border-gray-100 pb-2 last:border-0"
                  >
                    <span className="text-sm text-gray-600 hover:text-teal-600 cursor-pointer">
                      {notice.title}
                    </span>
                    <span className="text-xs text-gray-400">{notice.date}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  공지사항이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 반려동물 추가/수정 모달 */}
      {showPetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl overflow-auto max-h-[90vh] w-full max-w-3xl mx-4">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {selectedPet ? "반려동물 정보 수정" : "반려동물 등록"}
              </h2>
              {/* 수정 모드일 때는 닫기 버튼 제거 */}
              {!selectedPet && (
                <button
                  onClick={() => {
                    setShowPetModal(false);
                    setSelectedPet(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  닫기
                </button>
              )}
            </div>
            <div className="p-6">
              <Pet
                petData={selectedPet}
                onClose={() => {
                  setShowPetModal(false);
                  setSelectedPet(null);
                  fetchPets();
                }}
                isEditMode={!!selectedPet} // 수정 모드 여부를 Pet 컴포넌트에 전달
              />
            </div>
          </div>
        </div>
      )}

      {/* 백신 기록 조회 모달 */}
      {showVaccineModal && selectedPetForVaccine && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl overflow-auto max-h-[90vh] w-full max-w-4xl mx-4">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {selectedPetForVaccine.name}의 예방접종 기록
              </h2>
              <button
                onClick={() => {
                  setShowVaccineModal(false);
                  setSelectedPetForVaccine(null);
                  setVaccineRecords([]);
                  setVaccineCurrentPage(1); // 페이지 초기화
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                닫기
              </button>
            </div>
            <div className="p-6">
              {vaccineLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    백신 기록을 불러오는 중...
                  </div>
                </div>
              ) : vaccineRecords.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    {selectedPetForVaccine.name}의 예방접종 기록이 없습니다.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    총 {vaccineRecords.length}개의 백신 기록
                  </div>

                  {/* 백신 기록 리스트 - 페이지네이션 적용 */}
                  <div className="space-y-3">
                    {currentVaccineRecords.map((vaccine, index) => (
                      <div
                        key={vaccine.vaccinationId}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-lg">
                            {vaccineStartIndex + index + 1}.{" "}
                            {vaccine.vaccineName}
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                              vaccine.status
                            )}`}
                          >
                            {getStatusText(vaccine.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">접종일:</span>{" "}
                            {formatDate(vaccine.vaccinationDate)}
                          </div>
                          <div>
                            <span className="font-medium">회차:</span>{" "}
                            {vaccine.currentDose}/{vaccine.totalDoses}
                          </div>
                          {vaccine.nextDueDate && (
                            <div>
                              <span className="font-medium">다음접종일:</span>{" "}
                              {formatDate(vaccine.nextDueDate)}
                            </div>
                          )}
                        </div>

                        {vaccine.notes && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-gray-700">
                              메모:
                            </span>
                            <span className="text-gray-600 ml-1">
                              {vaccine.notes}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 백신 기록 페이지네이션 - 3개를 넘을 때만 표시 */}
                  {vaccineRecords.length > vaccineRecordsPerPage && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <button
                        className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                        onClick={() =>
                          handleVaccinePageChange(vaccineCurrentPage - 1)
                        }
                        disabled={vaccineCurrentPage === 1}
                      >
                        이전
                      </button>

                      {getVaccinePageNumbers().map((pageNum) => (
                        <button
                          key={pageNum}
                          className={`px-3 py-1 rounded ${
                            vaccineCurrentPage === pageNum
                              ? "bg-teal-500 text-white"
                              : "border border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => handleVaccinePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                        onClick={() =>
                          handleVaccinePageChange(vaccineCurrentPage + 1)
                        }
                        disabled={vaccineCurrentPage === vaccineTotalPages}
                      >
                        다음
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetManagement;
