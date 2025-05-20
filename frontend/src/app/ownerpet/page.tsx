"use client";

import { useState } from "react";
import Pet from "@/components/pet/page";
import { Calendar, Dog, Stethoscope, ClipboardPlus } from "lucide-react";

// StatCard 컴포넌트 추가
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, icon }: StatCardProps) => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-600 text-sm mb-1">{title}</p>
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
      <div className="text-gray-400">{icon}</div>
    </div>
  </div>
);

const notifications = [
  {
    id: 1,
    message: "네이버 예방접종 일정이 다가옵니다.",
    isNew: true,
  },
  {
    id: 2,
    message: "진료예약 4/2 오후 2시 확정되었습니다.",
    isNew: true,
  },
  {
    id: 3,
    message: "진료예약이 5/10으로 변경되었습니다.",
    isNew: false,
  },
];

// 상수 데이터 추가 (컴포넌트 밖에)
const notices = [
  {
    id: 1,
    title: "5월 진료 일정 안내",
    date: "2025-05-05",
  },
  {
    id: 2,
    title: "애완동물 반려견용 건강검진 안내",
    date: "2025-05-07",
  },
  {
    id: 3,
    title: "신규 의료진 소개 안내",
    date: "2025-05-09",
  },
  {
    id: 4,
    title: "동물등록제 관련안내 안내",
    date: "2025-05-13",
  },
];

const PetManagement = () => {
  const [showPetModal, setShowPetModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* 상단 통계 카드 섹션 */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {/* 예정된 예약 카드 */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm">예정된 예약</p>
              <h2 className="text-2xl font-bold mt-1">2</h2>
            </div>
            <div className="text-teal-500">
              <Calendar size={20} />
            </div>
          </div>
        </div>

        {/* 반려동물 카드 */}
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm">반려동물</p>
              <h2 className="text-2xl font-bold mt-1">5</h2>
            </div>
            <div className="text-blue-500">
              <Dog size={20} />
            </div>
          </div>
        </div>

        {/* 최근 진료 카드 */}
        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm">최근 진료</p>
              <h2 className="text-2xl font-bold mt-1">10</h2>
            </div>
            <div className="text-purple-500">
              <Stethoscope size={20} />
            </div>
          </div>
        </div>

        {/* 진료 내역 카드 */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm">진료 내역</p>
              <h2 className="text-2xl font-bold mt-1">2</h2>
            </div>
            <div className="text-amber-500">
              <ClipboardPlus size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1">
          {/* 반려동물 목록 섹션 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">등록된 반려동물</h2>
              <button
                onClick={() => setShowPetModal(true)}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
              >
                반려동물 추가
              </button>
            </div>

            {/* 반려동물 카드 그리드 */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src="/pet1.jpg"
                    alt="김또치"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">김또치</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      강아지
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>나이: 3세 (2022-05-15)</p>
                    <p>품종: 말티즈</p>
                    <p>체중: 3.5kg</p>
                    <p>성별: 수컷 (중성화 O)</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="text-blue-600 hover:text-blue-800">
                      <i className="fas fa-edit mr-1"></i> 수정
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <i className="fas fa-trash mr-1"></i> 삭제
                    </button>
                  </div>
                </div>
              </div>

              {/* 추가 반려동물 카드는 위와 같은 형식으로 반복 */}
            </div>
          </div>
        </div>

        {/* 우측 사이드바 */}
        <div className="w-80">
          {/* 알림 섹션 */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-4">최근 알림</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                </div>
                <p className="text-sm text-gray-600">
                  네이버 예방접종 일정이 다가옵니다.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                </div>
                <p className="text-sm text-gray-600">
                  진료예약 4/2 오후 2시 확정되었습니다.
                </p>
              </div>
              <div className="ml-5">
                <p className="text-sm text-gray-600">
                  진료예약이 5/10으로 변경되었습니다.
                </p>
              </div>
            </div>
            <div className="text-center mt-4">
              <button className="text-teal-500 hover:text-teal-600 text-sm">
                모든 알림 보기
              </button>
            </div>
          </div>

          {/* 공지사항 섹션 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">공지사항</h2>
            <div className="space-y-3">
              {notices.map((notice) => (
                <div key={notice.id} className="flex flex-col gap-1">
                  <span className="text-sm text-gray-600">{notice.title}</span>
                  <span className="text-xs text-gray-400">{notice.date}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <button className="text-teal-500 hover:text-teal-600 text-sm">
                모든 공지사항 보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 반려동물 추가 모달 */}
      {showPetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl overflow-auto max-h-[90vh] w-full max-w-3xl mx-4">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">반려동물 등록</h2>
              <button
                onClick={() => setShowPetModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <Pet onClose={() => setShowPetModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetManagement;
