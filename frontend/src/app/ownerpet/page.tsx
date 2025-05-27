"use client";

import { useState, useEffect } from "react";
import Pet from "@/components/pet/PetRegist";

import { useUser } from "@/contexts/UserContext";

interface Pet {
  id: number;
  name: string;
  birth: string;
  gender: string;
  species: string; // changed from type
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

const PetManagement = () => {
  const { user } = useUser();
  const [showPetModal, setShowPetModal] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);

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
      // Transform the data to match the new field names
      const transformedData = {
        ...data,
        birth: data.birth,
        profileUrl: data.profileUrl,
        lastDiroDate: data.lastDiroDate,
        species: data.species, // Add this line to transform type to species
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
              <h2 className="text-xl font-bold">등록된 반려동물</h2>
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
                pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={pet.profileUrl || "/default-pet.jpg"} // changed from imageUrl
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
                        <button
                          onClick={() => fetchPetDetail(pet.id)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeletePet(pet.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 우측 사이드바 */}
        <div className="w-1/4 space-y-6">
          {" "}
          {/* w-80에서 w-1/4로 변경 */}
          {/* 최근 알림 */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-[200px]">
            {" "}
            {/* h-[200px] 추가 */}
            <h2 className="text-xl font-bold mb-4">최근 알림</h2>
            <div className="space-y-3 overflow-y-auto h-[calc(100%-2rem)]">
              {" "}
              {/* overflow-y-auto와 높이 계산 추가 */}
              <div className="text-sm text-gray-500">
                새로운 알림이 없습니다.
              </div>
            </div>
          </div>
          {/* 공지사항 */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-[200px]">
            {" "}
            {/* h-[200px] 추가 */}
            <h2 className="text-xl font-bold mb-4">공지사항</h2>
            <div className="space-y-3 overflow-y-auto h-[calc(100%-2rem)]">
              {" "}
              {/* overflow-y-auto와 높이 계산 추가 */}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl overflow-auto max-h-[90vh] w-full max-w-3xl mx-4">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {selectedPet ? "반려동물 정보 수정" : "반려동물 등록"}
              </h2>
              <button
                onClick={() => {
                  setShowPetModal(false);
                  setSelectedPet(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                닫기
              </button>
            </div>
            <div className="p-6">
              <Pet
                petData={selectedPet}
                onClose={() => {
                  setShowPetModal(false);
                  setSelectedPet(null);
                  fetchPets();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetManagement;
