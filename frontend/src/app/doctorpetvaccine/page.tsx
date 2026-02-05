"use client";

import { Search } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import PetVaccineRegist from "@/components/doctorpetvaccine/PetVaccineRegist";
import VaccineChange from "@/components/doctorpetvaccine/change/VaccineChange";
import { useUser } from "@/contexts/UserContext";
import { toast } from "react-hot-toast";

// Gender enum 추가
enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

// VaccinationStatus enum 추가
enum VaccinationStatus {
  NOT_STARTED = "NOT_STARTED", // 미접종
  IN_PROGRESS = "IN_PROGRESS", // 접종진행중
  COMPLETED = "COMPLETED", // 접종완료
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
  vaccinations?: Vaccination[]; // 백신 정보 추가
}

// Vaccination 인터페이스 수정
interface Vaccination {
  id: number;
  petId: number;
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

// Reservation 인터페이스 (백엔드 DTO에 맞게 수정)
interface Reservation {
  id: number;
  userId: number;
  userName?: string;
  petId: number;
  petName?: string;
  doctorId?: number;
  doctorName?: string;
  reservationDate: string;
  reservationTime: string;
  status: string;
  symptom: string;
  type: "GENERAL" | "VACCINATION";
  createdAt: string;
  updatedAt: string;
}

// VaccineRequest 인터페이스 추가 (petId 제외 - PathVariable로 처리)
interface VaccineRequest {
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

const DoctorPetVaccineManagement = () => {
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [vaccines, setVaccines] = useState<Vaccination[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");

  // 백신 기록 조회 모달 관련 상태 추가
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedPetHistory, setSelectedPetHistory] = useState<Vaccination[]>(
    []
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedPetName, setSelectedPetName] = useState("");

  // VaccineChange 모달 관련 상태 추가
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [vaccineToEdit, setVaccineToEdit] = useState<Vaccination | null>(null);

  const { user } = useUser();

  // 사용 가능한 예약 목록 계산 (담당의사 필터링 추가)
  const availableReservations = useMemo(() => {
    // 이미 사용된 예약 ID들 추출
    const usedReservationIds = vaccines
      .filter(
        (vaccine) =>
          vaccine.reservationId !== null && vaccine.reservationId !== undefined
      )
      .map((vaccine) => vaccine.reservationId);

    // 사용되지 않은 예약만 필터링
    const filtered = reservations.filter((reservation) => {
      const isNotUsed = !usedReservationIds.includes(reservation.id);
      // 승인된 예약만 선택 가능
      const isValidStatus = reservation.status === "APPROVED";
      const isPetMatch = !selectedPet || reservation.petId === selectedPet.id;
      // 담당의사 필터링 추가 (현재 로그인한 의사가 담당인 예약만)
      const isDoctorMatch = reservation.doctorId === user?.id;
      // VACCINATION 타입 예약만 필터링
      const isVaccinationType = reservation.type === "VACCINATION";

      return (
        isNotUsed &&
        isValidStatus &&
        isPetMatch &&
        isDoctorMatch &&
        isVaccinationType
      );
    });

    return filtered;
  }, [vaccines, reservations, selectedPet, user?.id]);

  // 예약 데이터 가져오기 함수 (반려동물별로 조회)
  const fetchReservations = async () => {
    try {
      // 모든 반려동물의 예약을 가져오기
      const allReservations: Reservation[] = [];

      for (const pet of pets) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reservations/pet/${pet.id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );

          if (response.ok) {
            const petReservations = await response.json();
            allReservations.push(...petReservations);
          }
        } catch (error) {
          console.error(`Pet ${pet.id} 예약 조회 오류:`, error);
        }
      }

      setReservations(allReservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setReservations([]);
    }
  };

  // 전체 반려동물 조회
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctor/pets`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch pets");
        }

        const data = await response.json();
        setPets(data);
      } catch (error) {
        console.error("Error fetching pets:", error);
        setError("Failed to fetch pets");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, []);

  // 백신 정보 조회
  useEffect(() => {
    fetchVaccines();
  }, []);

  // 예약 정보 조회 (pets가 로드된 후에 실행)
  useEffect(() => {
    if (pets.length > 0) {
      fetchReservations();
    }
  }, [pets]);

  // 검색된 데이터 필터링 함수 - 이름, 종, 백신이름으로 검색
  const getFilteredData = () => {
    return pets.filter((pet) => {
      if (!pet) return false;

      // 해당 반려동물의 백신 기록들 가져오기
      const petVaccines = getAllVaccinesForPet(pet.id);
      const vaccineNames = petVaccines.map((v) => v.vaccineName).join(" ");

      const searchString = [
        pet.name || "", // 이름
        pet.species || "", // 종
        vaccineNames || "", // 백신이름들
      ]
        .join(" ")
        .toLowerCase();

      return searchString.includes(searchTerm.toLowerCase());
    });
  };

  // 날짜 포맷 함수 - 수정
  const formatDate = (dateString: string | null) => {
    if (
      !dateString ||
      dateString === null ||
      dateString === undefined ||
      dateString === ""
    ) {
      return "-";
    }

    try {
      // 다양한 날짜 형식 처리
      let date;
      // 이미 포맷된 한국어 형식인 경우 (2025. 5. 27.)
      if (dateString.includes(".") && dateString.includes(" ")) {
        return dateString;
      }
      // ISO 형식 체크 (2025-05-27T00:00:00)
      if (dateString.includes("T")) {
        date = new Date(dateString);
      }
      // 날짜만 있는 경우 (2025-05-27)
      else if (dateString.includes("-")) {
        const parts = dateString.split("-");
        if (parts.length === 3) {
          // 년-월-일 형식
          date = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2])
          );
        } else {
          date = new Date(dateString);
        }
      }
      // 숫자만 있는 경우 (timestamp)
      else if (!isNaN(Number(dateString))) {
        date = new Date(Number(dateString));
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        return "-";
      }

      // 한국어 형식으로 포맷 (2025. 5. 27.)
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      return `${year}. ${month}. ${day}.`;
    } catch (error) {
      console.error("Date formatting error:", error, "for date:", dateString);
      return "-";
    }
  };

  // 날짜를 백엔드 형식으로 변환하는 함수
  const formatDateForBackend = (dateString: string): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return "";
      }

      // ISO 형식으로 변환 (YYYY-MM-DD)
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  };

  // 특정 반려동물의 모든 백신 기록 가져오기
  const getAllVaccinesForPet = (petId: number): Vaccination[] => {
    if (!vaccines || vaccines.length === 0) {
      return [];
    }

    // 여러 방법으로 매칭 시도
    const filteredVaccines = vaccines.filter((vaccine) => {
      // 1. 직접 비교
      if (vaccine.petId === petId) {
        return true;
      }

      // 2. 문자열 변환 후 비교
      if (String(vaccine.petId) === String(petId)) {
        return true;
      }

      // 3. 숫자 변환 후 비교
      if (Number(vaccine.petId) === Number(petId)) {
        return true;
      }

      // 4. 반려동물 이름으로 매칭 (백업 방법)
      const pet = pets.find((p) => p.id === petId);
      if (pet && vaccine.petName === pet.name) {
        return true;
      }

      return false;
    });

    return filteredVaccines.sort((a, b) => {
      const dateA = new Date(a.vaccinationDate || 0);
      const dateB = new Date(b.vaccinationDate || 0);
      return dateB.getTime() - dateA.getTime();
    });
  };

  // 가장 최근 백신 기록만 가져오는 함수
  const getLatestVaccineForPet = (petId: number): Vaccination | null => {
    const petVaccines = getAllVaccinesForPet(petId);
    if (petVaccines.length === 0) return null;

    return petVaccines.reduce((latest, current) => {
      const latestDate = new Date(latest.vaccinationDate || 0);
      const currentDate = new Date(current.vaccinationDate || 0);

      return currentDate > latestDate ? current : latest;
    });
  };

  // 반려동물과 백신 데이터를 조합하는 함수 - 수정 (가장 최근 백신만 표시)
  const getCombinedData = () => {
    const filteredPets = getFilteredData();
    const petsWithVaccines: any[] = [];

    filteredPets.forEach((pet) => {
      // 가장 최근 백신 기록만 가져오기
      const latestVaccine = getLatestVaccineForPet(pet.id);
      const allVaccines = getAllVaccinesForPet(pet.id);

      // 각 반려동물당 하나의 행만 생성 (최신 백신 기록 또는 null)
      petsWithVaccines.push({
        ...pet,
        vaccine: latestVaccine,
        allVaccines: allVaccines,
        uniqueKey: `${pet.id}-latest`,
      });
    });

    return petsWithVaccines;
  };

  // 조회 함수 - 간단하게 수정
  const handleViewVaccineHistory = async (petId: number) => {
    const pet = pets.find((p) => p.id === petId);
    const petName = pet?.name || "알 수 없음";

    try {
      setHistoryLoading(true);
      setSelectedPetName(petName);

      // 백신 기록 조회
      const petVaccines = getAllVaccinesForPet(petId);

      if (petVaccines.length === 0) {
        toast.error(`${petName}의 백신 기록이 없습니다.`);
        return;
      }

      setSelectedPetHistory(petVaccines);
      setIsHistoryModalOpen(true);
    } catch (error) {
      console.error("백신 기록 조회 중 오류:", error);
      toast.error(`${petName}의 백신 기록을 불러오는데 실패했습니다.`);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 백신 수정 버튼 클릭 핸들러
  const handleVaccineEdit = (vaccine: Vaccination) => {
    setVaccineToEdit(vaccine);
    setIsChangeModalOpen(true);
    setIsHistoryModalOpen(false); // 조회 모달 닫기
  };

  // 백신 수정 성공 핸들러
  const handleEditSuccess = async () => {
    await fetchVaccines();
    await fetchPets();

    // 조회 모달의 데이터도 업데이트
    if (selectedPetHistory.length > 0) {
      const petId = selectedPetHistory[0].petId;
      const updatedVaccines = getAllVaccinesForPet(petId);
      setSelectedPetHistory(updatedVaccines);
    }
  };

  // 백신 삭제 함수 - 모달에서 사용 (권한 검증 추가)
  const handleVaccineDeleteFromModal = async (vaccinationId: number) => {
    if (!window.confirm("해당 백신 기록을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctor/vaccines/${vaccinationId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // 403 에러 처리 추가
      if (response.status === 403) {
        toast.error("본인이 등록한 예방접종만 삭제할 수 있습니다.");
        return;
      }

      if (!response.ok) throw new Error("백신 정보 삭제에 실패했습니다");

      // 데이터 새로고침
      await fetchVaccines();
      await fetchPets();

      // 모달 내 데이터도 업데이트
      const updatedVaccines = selectedPetHistory.filter(
        (v) => v.id !== vaccinationId
      );
      setSelectedPetHistory(updatedVaccines);

      toast.success("백신 정보가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting vaccine:", error);
      toast.error("백신 정보 삭제에 실패했습니다");
    }
  };

  // 페이지네이션된 데이터 계산
  const getPaginatedData = () => {
    const combinedData = getCombinedData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return combinedData.slice(startIndex, endIndex);
  };

  // 전체 페이지 수 계산
  useEffect(() => {
    const combinedData = getCombinedData();
    setTotalPages(Math.ceil(combinedData.length / itemsPerPage));
  }, [pets, vaccines, searchTerm]);

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

  // 백신 조회 함수
  const fetchVaccines = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctor/vaccines`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 응답 데이터가 배열인지 확인
      if (Array.isArray(data)) {
        setVaccines(data);
      } else {
        setVaccines([]);
      }
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      setVaccines([]);
    }
  };

  // 백신 등록 함수 수정
  const handleVaccineRegister = async (
    petId: number,
    vaccineData: VaccineRequest
  ) => {
    try {
      // 날짜 형식을 백엔드가 기대하는 형식으로 변환
      const formattedData = {
        ...vaccineData,
        vaccinationDate: vaccineData.vaccinationDate
          ? formatDateForBackend(vaccineData.vaccinationDate)
          : null,
        nextDueDate: vaccineData.nextDueDate
          ? formatDateForBackend(vaccineData.nextDueDate)
          : null,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctor/vaccines/${petId}/vaccinereg`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "접종 등록에 실패했습니다");
      }

      // 백신 목록 새로고침
      await fetchVaccines();
      // 반려동물 목록도 새로고침
      await fetchPets();

      setIsVaccineModalOpen(false);
      toast.success("백신이 성공적으로 등록되었습니다.");
    } catch (error) {
      console.error("Error registering vaccine:", error);
      toast.error("접종 등록에 실패했습니다");
    }
  };

  // 반려동물 목록 새로고침 함수
  const fetchPets = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctor/pets`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pets");
      }

      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error("Error refreshing pets:", error);
    }
  };

  // 백신 관리 버튼 클릭 핸들러 수정
  const handleVaccineManageClick = (petId: number) => {
    const pet = pets.find((p) => p.id === petId);
    if (pet) {
      setSelectedPet(pet);
      setIsVaccineModalOpen(true);
    } else {
      console.error("Pet not found");
      toast.error("반려동물 정보를 찾을 수 없습니다.");
    }
  };

  // 백신 등록 처리 함수 - 날짜 형식 처리 추가
  const handleVaccineSubmit = async (data: any): Promise<void> => {
    if (!selectedPet?.id) {
      toast.error("반려동물 정보를 찾을 수 없습니다.");
      return;
    }

    // 데이터 검증
    if (!data.vaccinationDate) {
      toast.error("접종일을 입력해주세요.");
      return;
    }

    await handleVaccineRegister(selectedPet.id, data);
  };

  // 접종 상태 한글 변환 함수
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-500">데이터를 불러오는 중...</div>
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
        <div className="flex justify-start items-center mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="반려동물/종/백신이름 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          총 {getCombinedData().length}개의 항목 (반려동물{" "}
          {getFilteredData().length}마리, 접종 기록 {vaccines.length}개, 내 담당
          예약 {availableReservations.length}개)
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                이름
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                종
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                백신이름
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                총접종회차
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                회차
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                접종일
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                다음접종일
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                접종상태
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                메모
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {getPaginatedData().map((item: any) => (
              <tr
                key={item.uniqueKey}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-4">
                  {item.name || "-"}
                  {item.allVaccines && item.allVaccines.length > 1 && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {item.allVaccines.length}건
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">{item.species || "-"}</td>
                <td className="py-3 px-4">
                  {item.vaccine?.vaccineName || "-"}
                </td>
                <td className="py-3 px-4">{item.vaccine?.totalDoses || "-"}</td>
                <td className="py-3 px-4">
                  {item.vaccine?.currentDose || "-"}
                </td>
                <td className="py-3 px-4">
                  {formatDate(item.vaccine?.vaccinationDate)}
                </td>
                <td className="py-3 px-4">
                  {formatDate(item.vaccine?.nextDueDate)}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item.vaccine?.status === VaccinationStatus.COMPLETED
                        ? "bg-green-100 text-green-800"
                        : item.vaccine?.status === VaccinationStatus.IN_PROGRESS
                        ? "bg-yellow-100 text-yellow-800"
                        : item.vaccine?.status === VaccinationStatus.NOT_STARTED
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.vaccine ? getStatusText(item.vaccine.status) : "-"}
                  </span>
                </td>
                <td className="py-3 px-4">{item.vaccine?.notes || "-"}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-1 flex-wrap">
                    <button
                      className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                      onClick={() => handleVaccineManageClick(item.id)}
                    >
                      접종관리
                    </button>
                    <button
                      className="text-green-500 hover:text-green-700 text-sm px-2 py-1 border border-green-200 rounded hover:bg-green-50"
                      onClick={() => handleViewVaccineHistory(item.id)}
                      disabled={historyLoading}
                    >
                      {historyLoading ? "로딩..." : "조회"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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

      {/* 백신 등록 모달 (PetVaccineRegist - 등록 전용) */}
      {user?.id && (
        <PetVaccineRegist
          isOpen={isVaccineModalOpen}
          onClose={() => setIsVaccineModalOpen(false)}
          petId={selectedPet?.id || 0}
          doctorId={user.id}
          onSubmit={handleVaccineSubmit}
          availableReservations={availableReservations}
        />
      )}

      {/* 백신 수정 모달 (VaccineChange - 수정 전용) */}
      {vaccineToEdit && (
        <VaccineChange
          isOpen={isChangeModalOpen}
          onClose={() => {
            setIsChangeModalOpen(false);
            setVaccineToEdit(null);
          }}
          vaccination={vaccineToEdit}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* 백신 기록 조회 모달 - 권한 기반 버튼 표시 */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-start items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedPetName}의 백신 접종 기록 (총{" "}
                {selectedPetHistory.length}건)
              </h3>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">백신 기록을 불러오는 중...</div>
              </div>
            ) : selectedPetHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                백신 기록이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedPetHistory.map((vaccine, index) => (
                  <div
                    key={vaccine.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-lg">
                        {index + 1}. {vaccine.vaccineName}
                      </div>
                      <div className="flex gap-2 items-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            vaccine.status === VaccinationStatus.COMPLETED
                              ? "bg-green-100 text-green-800"
                              : vaccine.status === VaccinationStatus.IN_PROGRESS
                              ? "bg-yellow-100 text-yellow-800"
                              : vaccine.status === VaccinationStatus.NOT_STARTED
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {getStatusText(vaccine.status)}
                        </span>
                        {/* 권한 기반 버튼 표시 - 본인이 등록한 기록만 수정/삭제 가능 */}
                        {vaccine.doctorId === user?.id && (
                          <>
                            <button
                              onClick={() => handleVaccineEdit(vaccine)}
                              className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                            >
                              수정
                            </button>
                            <button
                              onClick={() =>
                                handleVaccineDeleteFromModal(vaccine.id)
                              }
                              className="text-red-500 hover:text-red-700 text-sm px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
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
                      <div>
                        <span className="font-medium">담당의사:</span>{" "}
                        {vaccine.doctorName}
                      </div>
                    </div>

                    {vaccine.notes && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-gray-700">메모:</span>
                        <span className="text-gray-600 ml-1">
                          {vaccine.notes}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
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

export default DoctorPetVaccineManagement;
