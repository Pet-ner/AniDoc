import { useState, useEffect } from "react";
import PetChange from "../change/PetChange";

interface Pet {
  id: number;
  name: string;
  birthDate: string;
  gender: string;
  type: string;
  breed: string;
  weight: number;
  imageUrl?: string;
}

const PetList = () => {
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]); // pets 상태 추가

  // 반려동물 목록 가져오기
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pets`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("반려동물 목록을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setPets(data);
      } catch (error) {
        console.error("반려동물 목록 조회 실패:", error);
      }
    };

    fetchPets();
  }, []);

  const handleModifyClick = (petId: number) => {
    setSelectedPetId(petId);
    setIsChangeModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPetId(null);
    setIsChangeModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* 반려동물 목록 */}
      <div className="grid gap-4">
        {pets.map((pet) => (
          <div key={pet.id} className="p-4 border rounded-lg shadow-sm">
            <div className="flex items-start space-x-4">
              {pet.imageUrl && (
                <img
                  src={pet.imageUrl}
                  alt={pet.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{pet.name}</h3>
                <p className="text-gray-600">
                  나이: {calculateAge(pet.birthDate)}
                </p>
                <p className="text-gray-600">품종: {pet.breed}</p>
                <p className="text-gray-600">체중: {pet.weight}kg</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleModifyClick(pet.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  수정
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 수정 모달 */}
      {isChangeModalOpen && selectedPetId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PetChange petId={selectedPetId} onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
};

// 나이 계산 헬퍼 함수
const calculateAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1;
  }
  return age;
};

export default PetList;
