"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { formatDate } from "@/utils/formatDate";
import { Calendar as CalendarIcon, Clock, Dog, FileText } from "lucide-react";
import Link from "next/link";

// 반려동물 타입
interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
}

// 시간 슬롯 타입
interface TimeSlot {
  time: string;
  available: boolean;
}

export default function CreateReservation() {
  const router = useRouter();
  const { user } = useUser();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [symptom, setSymptom] = useState<string>("");
  const [type, setType] = useState<string>("GENERAL"); // 기본값 일반진료
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // 오늘 날짜 기본값
  useEffect(() => {
    const today = formatDate(new Date());
    setSelectedDate(today);
  }, []);

  // 유저의 반려동물 목록 조회
  useEffect(() => {
    if (!user) return;

    const fetchPets = async () => {
      try {
        setLoading(true);
        // 펫 조회 API 호출 (일단 샘플 데이터로..)
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pets/user/${user.id}`);
        // if (!response.ok) throw new Error("반려동물 정보를 불러오는데 실패했습니다.");
        // const data = await response.json();

        // 샘플 데이터
        const mockData = [
          { id: 1, name: "몽이", species: "강아지", breed: "비숑" },
          { id: 2, name: "나비", species: "고양이", breed: "샴" },
        ];

        setPets(mockData);
        if (mockData.length > 0) {
          setSelectedPet(mockData[0].id);
        }
      } catch (error) {
        console.error("반려동물 정보 로드 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [user]);

  // 날짜 선택 시 해당 날짜의 예약 가능 시간 조회
  useEffect(() => {
    if (!selectedDate) return;

    const fetchTimeSlots = async () => {
      try {
        setLoading(true);
        // 예약 가능 시간 조회 API 호출
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reservations/available-slots/${selectedDate}`,
          {
            credentials: "include",
          }
        );
        if (!response.ok)
          throw new Error("예약 가능 시간을 불러오는데 실패했습니다.");
        const data = await response.json();
        console.log(data);
        setTimeSlots(data);

        // 가능한 시간 중에 가장 첫 번째 슬롯 기본 선택
        // @ts-ignore
        const firstAvailable = data.find((slot) => slot.available);
        if (firstAvailable) {
          setSelectedTime(firstAvailable.time);
        } else {
          setSelectedTime("");
        }
      } catch (error) {
        console.error("예약 가능 시간 로드 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate]);

  // 예약 등록
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPet || !selectedDate || !selectedTime || !type) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        petId: selectedPet,
        reservationDate: selectedDate,
        reservationTime: selectedTime,
        symptom,
        type,
      };

      // 예약 등록 API 호출
      console.log("예약 등록 데이터:", requestData);
      const response = await fetch(
        // @ts-ignore
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reservations?userId=${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "예약 등록에 실패했습니다.");
      }

      const data = await response.json();
      alert("예약 등록에 성공했습니다.");
      router.push("/");
    } catch (error: any) {
      console.error("예약 등록 오류:", error);
      alert(error.message || "예약 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        {/* 진행 상태 표시 */}
        <div className="bg-teal-50 px-6 py-4 border-b border-teal-100">
          <h2 className="text-lg font-medium text-teal-700">새 예약 정보</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* 반려동물 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Dog className="mr-2 text-teal-500" size={18} />
              반려동물 선택
            </label>
            {pets.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-sm text-yellow-700">
                  등록된 반려동물이 없습니다.{" "}
                  <Link
                    href="/pets"
                    className="font-medium text-teal-600 hover:text-teal-500"
                  >
                    반려동물 등록하기
                  </Link>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    onClick={() => setSelectedPet(pet.id)}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                      selectedPet === pet.id
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-teal-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{pet.name}</h3>
                        <p className="text-xs text-gray-500">
                          {pet.species} / {pet.breed}
                        </p>
                      </div>
                      {selectedPet === pet.id && (
                        <span className="bg-teal-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 예약 유형 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FileText className="mr-2 text-teal-500" size={18} />
              진료 유형
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setType("GENERAL")}
                className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                  type === "GENERAL"
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200 hover:border-teal-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">일반 진료</h3>
                    <p className="text-xs text-gray-500">
                      건강 검진, 질병 진단 등
                    </p>
                  </div>
                  {type === "GENERAL" && (
                    <span className="bg-teal-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </div>
              </div>
              <div
                onClick={() => setType("VACCINATION")}
                className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                  type === "VACCINATION"
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200 hover:border-teal-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">예방접종</h3>
                    <p className="text-xs text-gray-500">정기 예방접종</p>
                  </div>
                  {type === "VACCINATION" && (
                    <span className="bg-teal-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 날짜 및 시간 선택 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 날짜 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CalendarIcon className="mr-2 text-teal-500" size={18} />
                예약 날짜
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={formatDate(new Date())}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* 시간 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="mr-2 text-teal-500" size={18} />
                예약 시간
              </label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-2 px-3 rounded-md text-center text-sm transition-colors duration-200 ${
                      selectedTime === slot.time
                        ? "bg-teal-500 text-white"
                        : slot.available
                        ? "bg-white border border-gray-300 hover:border-teal-500 text-gray-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {slot.time.substring(0, 5)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 증상 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              증상 및 참고사항
            </label>
            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              rows={4}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
              placeholder="반려동물의 증상이나 참고할 사항을 자세히 작성해주세요."
            />
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="submit"
            disabled={loading || !selectedPet || !selectedDate || !selectedTime}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? "처리 중..." : "예약하기"}
          </button>
          <Link
            href="/"
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
