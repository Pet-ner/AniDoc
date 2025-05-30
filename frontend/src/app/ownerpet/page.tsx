"use client";

import { useState, useEffect } from "react";
import { Camera, Heart, ImageOff, Edit, Clipboard, Trash2 } from "lucide-react";
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

// PetImage 컴포넌트
interface PetImageProps {
  profileUrl?: string;
  petName: string;
}

const PetImage: React.FC<PetImageProps> = ({ profileUrl, petName }) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const maxRetries = 2;

  // S3 Presigned URL 발급 함수 (이중 인코딩 문제 완전 해결)
  const generatePresignedViewUrl = async (
    originalUrl: string
  ): Promise<string | null> => {
    try {
      console.log("Original URL:", originalUrl);

      // S3 키 추출
      let s3Key = originalUrl.split(".com/")[1];
      if (!s3Key) return null;

      // 쿼리 파라미터 제거 (기존 presigned URL인 경우)
      s3Key = s3Key.split("?")[0];

      // 이중 인코딩 해결: %25로 시작하는 패턴을 반복적으로 디코딩
      let decodedKey = s3Key;
      let previousKey = "";

      // 더 이상 디코딩되지 않을 때까지 반복
      while (decodedKey !== previousKey && decodedKey.includes("%")) {
        previousKey = decodedKey;
        try {
          decodedKey = decodeURIComponent(decodedKey);
        } catch (e) {
          console.warn("디코딩 실패, 이전 값 사용:", previousKey);
          decodedKey = previousKey;
          break;
        }
      }

      console.log("Original S3 Key:", s3Key);
      console.log("Decoded S3 Key:", decodedKey);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/s3/presigned-url/view?s3Key=${encodeURIComponent(decodedKey)}`,
        {
          credentials: "include",
        }
      );

      console.log("Presigned URL response status:", response.status);

      if (!response.ok) {
        console.error(`Presigned URL 발급 실패: ${response.status}`);
        const errorText = await response.text();
        console.error("Error details:", errorText);
        return null;
      }

      const data = await response.json();
      console.log("Presigned URL data:", data);
      return data.url;
    } catch (error) {
      console.error("Presigned URL 발급 중 오류:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      console.log("Loading image for:", petName, "URL:", profileUrl);

      if (!profileUrl) {
        console.log("No profile URL, showing fallback text");
        setImageUrl("");
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        // S3 URL인지 확인
        if (
          profileUrl.includes(
            "anidoc-bucket.s3.ap-northeast-2.amazonaws.com"
          ) ||
          profileUrl.includes("s3.ap-northeast-2.amazonaws.com")
        ) {
          console.log("S3 URL detected, generating presigned URL");

          const presignedUrl = await generatePresignedViewUrl(profileUrl);
          if (presignedUrl) {
            console.log("Presigned URL generated successfully:", presignedUrl);
            setImageUrl(presignedUrl);
            setRetryCount(0); // 성공 시 재시도 카운트 리셋
          } else {
            console.log("Presigned URL generation failed");
            throw new Error("Presigned URL 생성 실패");
          }
        } else {
          console.log("Non-S3 URL, using original:", profileUrl);
          setImageUrl(profileUrl);
        }
      } catch (error) {
        console.error("이미지 로딩 오류:", error);

        // 재시도 로직
        if (retryCount < maxRetries) {
          console.log(`재시도 ${retryCount + 1}/${maxRetries}`);
          setRetryCount((prev) => prev + 1);
          setTimeout(() => {
            loadImage(); // 1초 후 재시도
          }, 1000);
          return;
        }

        // 최대 재시도 횟수 초과 시 에러 상태로 설정
        setError(true);
        setImageUrl("");
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [profileUrl, petName, retryCount]);

  const handleImageError = () => {
    console.error("Image failed to load:", imageUrl);
    if (!error && retryCount < maxRetries) {
      console.log("이미지 로딩 실패, 재시도 시작");
      setRetryCount((prev) => prev + 1);
    } else {
      setError(true);
      setImageUrl("");
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-3"></div>
          <span className="text-sm text-gray-600">
            로딩 중...
            {retryCount > 0 && ` (재시도 ${retryCount}/${maxRetries})`}
          </span>
        </div>
      </div>
    );
  }

  // 이미지가 없거나 에러가 발생한 경우 예쁜 아이콘과 함께 표시
  if (error || !imageUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center p-6">
          {/* 여러 아이콘을 조합한 예쁜 디자인 */}
          <div className="relative mb-4">
            {/* 배경 원형 */}
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Camera className="w-8 h-8 text-white" />
            </div>
            {/* 작은 하트 아이콘 */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center">
              <Heart className="w-3 h-3 text-white fill-current" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-gray-600 text-sm font-medium">
              반려동물 이미지없음
            </div>
            <div className="text-gray-400 text-xs">사진을 등록해보세요</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <img
        src={imageUrl}
        alt={petName}
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={handleImageError}
        onLoad={() => console.log("Image loaded successfully:", imageUrl)}
      />
      {retryCount > 0 && !error && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
          재시도 중
        </div>
      )}
    </div>
  );
};

const PetManagement = () => {
  const { user } = useUser();
  const [showPetModal, setShowPetModal] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);

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

  // 성별 표시 함수
  const getGenderText = (gender: string) => {
    switch (gender) {
      case "MALE":
        return "수컷";
      case "FEMALE":
        return "암컷";
      default:
        return gender;
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
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <div className="w-full max-w-7xl mx-auto">
        {/* 반려동물 목록 섹션 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              등록된 반려동물 ({pets.length}마리)
            </h2>
            {/* 텍스트 버튼 스타일로 변경 */}
            <button
              onClick={() => {
                setSelectedPet(null);
                setShowPetModal(true);
              }}
              className="border-none bg-transparent text-teal-600 font-medium text-lg cursor-pointer hover:text-teal-800 hover:underline transition-colors duration-200"
            >
              + 반려동물 추가
            </button>
          </div>

          {/* 반려동물 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                <span className="ml-3 text-gray-600">로딩 중...</span>
              </div>
            ) : pets.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 text-lg">
                  등록된 반려동물이 없습니다.
                </div>
                {/* 텍스트 버튼 스타일로 변경 */}
                <button
                  onClick={() => {
                    setSelectedPet(null);
                    setShowPetModal(true);
                  }}
                  className="mt-4 border-none bg-transparent text-teal-600 font-medium text-lg cursor-pointer hover:text-teal-800 hover:underline transition-colors duration-200"
                >
                  첫 번째 반려동물 등록하기
                </button>
              </div>
            ) : (
              currentPets.map((pet) => (
                <div
                  key={pet.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                >
                  {/* 이미지 영역 */}
                  <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                    <PetImage profileUrl={pet.profileUrl} petName={pet.name} />
                  </div>

                  {/* 정보 영역 */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800 truncate">
                        {pet.name}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ml-2">
                        {pet.species}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span className="font-medium">품종:</span>
                        <span className="truncate ml-2">
                          {pet.breed || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">체중:</span>
                        <span>{pet.weight}kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">성별:</span>
                        <span>
                          {getGenderText(pet.gender)}{" "}
                          {pet.isNeutered ? "(중성화 O)" : "(중성화 X)"}
                        </span>
                      </div>
                    </div>

                    {/* lucide-react 아이콘으로 변경된 버튼 영역 */}
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleViewVaccination(pet)}
                        className="w-full border-none bg-transparent text-green-600 font-medium text-sm cursor-pointer hover:text-green-800 hover:underline transition-colors duration-200 py-2 flex items-center justify-center gap-2"
                        disabled={vaccineLoading}
                      >
                        <Clipboard className="w-4 h-4" />
                        {vaccineLoading ? "로딩..." : "예방접종 조회"}
                      </button>

                      <div className="flex justify-between">
                        <button
                          onClick={() => fetchPetDetail(pet.id)}
                          className="border-none bg-transparent text-blue-600 font-medium text-sm cursor-pointer hover:text-blue-800 hover:underline transition-colors duration-200 flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          수정
                        </button>
                        <button
                          onClick={() => handleDeletePet(pet.id)}
                          className="border-none bg-transparent text-red-600 font-medium text-sm cursor-pointer hover:text-red-800 hover:underline transition-colors duration-200 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 텍스트 버튼 스타일로 변경된 페이지네이션 */}
          {pets.length > petsPerPage && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                className="border-none bg-transparent text-gray-600 font-medium cursor-pointer hover:text-gray-800 hover:underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← 이전
              </button>

              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  className={`border-none bg-transparent font-medium cursor-pointer transition-colors duration-200 px-2 py-1 ${
                    currentPage === pageNum
                      ? "text-teal-600 font-bold underline"
                      : "text-gray-600 hover:text-gray-800 hover:underline"
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                className="border-none bg-transparent text-gray-600 font-medium cursor-pointer hover:text-gray-800 hover:underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                다음 →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 반려동물 추가/수정 모달 */}
      {showPetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl overflow-auto max-h-[90vh] w-full max-w-3xl mx-4 shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedPet ? "반려동물 정보 수정" : "반려동물 등록"}
              </h2>
              {!selectedPet && (
                <button
                  onClick={() => {
                    setShowPetModal(false);
                    setSelectedPet(null);
                  }}
                  className="border-none bg-transparent text-gray-500 font-medium text-xl cursor-pointer hover:text-gray-700 transition-colors duration-200"
                >
                  ✕
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
                isEditMode={!!selectedPet}
              />
            </div>
          </div>
        </div>
      )}

      {/* 백신 기록 조회 모달 */}
      {showVaccineModal && selectedPetForVaccine && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl overflow-auto max-h-[90vh] w-full max-w-4xl mx-4 shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedPetForVaccine.name}의 예방접종 기록
              </h2>
              {/* 텍스트 버튼 스타일로 변경 */}
              <button
                onClick={() => {
                  setShowVaccineModal(false);
                  setSelectedPetForVaccine(null);
                  setVaccineRecords([]);
                  setVaccineCurrentPage(1);
                }}
                className="border-none bg-transparent text-gray-500 font-medium text-xl cursor-pointer hover:text-gray-700 transition-colors duration-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {vaccineLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                  <div className="text-gray-500 mt-4">
                    백신 기록을 불러오는 중...
                  </div>
                </div>
              ) : vaccineRecords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">
                    {selectedPetForVaccine.name}의 예방접종 기록이 없습니다.
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    총{" "}
                    <span className="font-semibold text-teal-600">
                      {vaccineRecords.length}개
                    </span>
                    의 백신 기록
                  </div>

                  <div className="space-y-4">
                    {currentVaccineRecords.map((vaccine, index) => (
                      <div
                        key={vaccine.vaccinationId}
                        className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-semibold text-lg text-gray-800">
                            {vaccineStartIndex + index + 1}.{" "}
                            {vaccine.vaccineName}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              vaccine.status
                            )}`}
                          >
                            {getStatusText(vaccine.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span className="font-medium">접종일:</span>
                            <span>{formatDate(vaccine.vaccinationDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">회차:</span>
                            <span>
                              {vaccine.currentDose}/{vaccine.totalDoses}
                            </span>
                          </div>
                          {vaccine.nextDueDate && (
                            <div className="flex justify-between md:col-span-2">
                              <span className="font-medium">다음접종일:</span>
                              <span className="text-orange-600 font-medium">
                                {formatDate(vaccine.nextDueDate)}
                              </span>
                            </div>
                          )}
                        </div>

                        {vaccine.notes && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <span className="font-medium text-gray-700 text-sm">
                              메모:
                            </span>
                            <p className="text-gray-600 text-sm mt-1">
                              {vaccine.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 텍스트 버튼 스타일로 변경된 백신 기록 페이지네이션 */}
                  {vaccineRecords.length > vaccineRecordsPerPage && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                      <button
                        className="border-none bg-transparent text-gray-600 font-medium cursor-pointer hover:text-gray-800 hover:underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
                        onClick={() =>
                          handleVaccinePageChange(vaccineCurrentPage - 1)
                        }
                        disabled={vaccineCurrentPage === 1}
                      >
                        ← 이전
                      </button>

                      {getVaccinePageNumbers().map((pageNum) => (
                        <button
                          key={pageNum}
                          className={`border-none bg-transparent font-medium cursor-pointer transition-colors duration-200 px-2 py-1 ${
                            vaccineCurrentPage === pageNum
                              ? "text-teal-600 font-bold underline"
                              : "text-gray-600 hover:text-gray-800 hover:underline"
                          }`}
                          onClick={() => handleVaccinePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        className="border-none bg-transparent text-gray-600 font-medium cursor-pointer hover:text-gray-800 hover:underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
                        onClick={() =>
                          handleVaccinePageChange(vaccineCurrentPage + 1)
                        }
                        disabled={vaccineCurrentPage === vaccineTotalPages}
                      >
                        다음 →
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
