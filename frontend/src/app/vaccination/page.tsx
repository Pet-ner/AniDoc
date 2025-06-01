"use client";

import { Edit2, Search, Eye } from "lucide-react";
import { useEffect, useState } from "react";

interface VaccinationRecord {
  id: number;
  petName: string;
  vaccineName: string;
  currentDose: number;
  totalDoses: number;
  vaccinationDate: string;
  nextDueDate: string;
  status: "NOT_VACCINATED" | "IN_PROGRESS" | "COMPLETED";
  notes: string;
  doctorName: string;
  reservationDate: string;
  reservationTime: string;
}

interface VaccinationPageProps {
  records: VaccinationRecord[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  onOpenVaccination: (record: VaccinationRecord) => void;
  userId: number;
}

export default function VaccinationPage({
  records = [],
  loading,
  search,
  setSearch,
  onOpenVaccination,
  userId,
}: VaccinationPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "NOT_VACCINATED":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "NOT_VACCINATED":
        return "미접종";
      case "IN_PROGRESS":
        return "접종진행중";
      case "COMPLETED":
        return "접종완료";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm px-2 py-5">
      <div className="flex justify-end items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="반려동물 검색"
              className="pr-8 pl-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
            />
            <Search
              size={16}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                예약일
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                예약시간
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                반려동물
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                백신명
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                접종기록
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  로딩 중...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  기록이 없습니다.
                </td>
              </tr>
            ) : (
              records
                .filter((r) =>
                  r.petName.toLowerCase().includes(search.toLowerCase())
                )
                .sort((a, b) => {
                  const dateA = new Date(
                    `${a.reservationDate} ${a.reservationTime}`
                  );
                  const dateB = new Date(
                    `${b.reservationDate} ${b.reservationTime}`
                  );
                  return dateB.getTime() - dateA.getTime();
                })
                .slice(
                  (currentPage - 1) * recordsPerPage,
                  currentPage * recordsPerPage
                )
                .map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.reservationDate}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.reservationTime}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#49BEB7] font-medium">
                      {r.petName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.vaccineName}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(
                          r.status
                        )}`}
                      >
                        {getStatusText(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.currentDose}/{r.totalDoses}차
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center items-center gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
        >
          이전
        </button>
        <div className="flex gap-1">
          {Array.from(
            {
              length: Math.ceil(
                records.filter((r) =>
                  r.petName.toLowerCase().includes(search.toLowerCase())
                ).length / recordsPerPage
              ),
            },
            (_, i) => i + 1
          ).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-3 py-1 rounded-md ${
                currentPage === pageNum
                  ? "bg-[#49BEB7] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(
                prev + 1,
                Math.ceil(
                  records.filter((r) =>
                    r.petName.toLowerCase().includes(search.toLowerCase())
                  ).length / recordsPerPage
                )
              )
            )
          }
          disabled={
            currentPage >=
            Math.ceil(
              records.filter((r) =>
                r.petName.toLowerCase().includes(search.toLowerCase())
              ).length / recordsPerPage
            )
          }
          className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
        >
          다음
        </button>
      </div>
    </div>
  );
}
