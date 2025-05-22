"use client";

import { Search, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface MedicalRecord {
  id: number;
  reservationTime: string;
  petName: string;
  symptom: string;
  doctorName: string;
  status: string;
  userId: number;
  reservationId: number;
}

interface UserMedicalRecordProps {
  records: MedicalRecord[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
}

export default function UserMedicalRecord({
  records,
  loading,
  search,
  setSearch,
}: UserMedicalRecordProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">진료 기록 조회</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="반려동물 이름 검색"
              className="pr-8 pl-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
            />
            <Search size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">시간</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">반려동물</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">증상</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">담당의</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">상태</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">조회</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-4 text-gray-500">로딩 중...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4 text-gray-500">진료 기록이 없습니다.</td></tr>
            ) : (
              records
                .filter(r => r.petName.toLowerCase().includes(search.toLowerCase()))
                .map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-700">{r.reservationTime}</td>
                    <td className="px-4 py-4 text-sm text-[#49BEB7] font-medium">{r.petName}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{r.symptom}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{r.doctorName}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex text-xs px-2 py-1 rounded-full ${r.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => router.push(`/medical-records/${r.id}`)}
                        className="flex items-center gap-1 text-sm text-[#49BEB7] hover:text-[#3ea9a2]"
                      >
                        <Eye size={16} /> 기록 조회
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
