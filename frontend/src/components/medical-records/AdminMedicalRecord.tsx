"use client";

import { Search, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ChartDetailModal from "./ChartDetailModal";

interface MedicalRecord {
  id: number;
  reservationTime: string;
  petName: string;
  symptom: string;
  doctorName: string;
  status: string;
  userId: number;
  reservationId: number;
  hasMedicalRecord: boolean;
  weight?: number;
  age?: number;
  diagnosis?: string;
  treatment?: string;
  surgery?: {
    surgeryName: string;
    surgeryDate: string;
    anesthesiaType: string;
    surgeryNote: string;
    resultUrl?: string;
  };
  hospitalization?: {
    admissionDate: string;
    dischargeDate: string;
    reason: string;
    imageUrl?: string;
  };
  checkups?: {
    checkupType: string;
    checkupDate: string;
    result: string;
    resultUrl?: string;
  }[];
  userName?: string;
  petId?: number;
  doctorId?: number;
  reservationDate?: string;
  createdAt?: string;
  updatedAt?: string;
  type?: string;
}

interface AdminMedicalRecordProps {
  search: string;
  setSearch: (s: string) => void;
}

export default function AdminMedicalRecord({
  search,
  setSearch,
}: AdminMedicalRecordProps) {
  const router = useRouter();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [showDetail, setShowDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      setLoading(true);
      try {
        // Get the current user's ID from your auth context or session
        const userId = 1; // TODO: Replace with actual user ID from your auth system

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records?userId=${userId}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch medical records");
        }

        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error("❌ 진료기록 목록 조회 실패:", err);
        alert("진료기록을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  const handleClick = async (record: MedicalRecord) => {
    if (!record.id) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records/by-reservation/${record.reservationId}?userId=${record.userId}`,
        { credentials: "include" }
      );
      const responseBody = await res.json();
      const medicalRecord = responseBody.medicalRecord;

      if (!medicalRecord) {
        alert("진료기록을 찾을 수 없습니다.");
        return;
      }

      const updatedRecord = {
        ...record,
        weight: medicalRecord.currentWeight,
        age: medicalRecord.age,
        diagnosis: medicalRecord.diagnosis,
        treatment: medicalRecord.treatment,
        surgery: medicalRecord.surgery,
        hospitalization: medicalRecord.hospitalization,
        checkups: medicalRecord.checkups,
      };

      setSelectedRecord(updatedRecord);
      setShowDetail(true);
    } catch (err) {
      console.error("진료기록 조회 실패", err);
      alert("진료기록을 불러오는 데 실패했습니다.");
    }
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
    setShowDetail(false);
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
              placeholder="반려동물 이름 검색"
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
                날짜
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                시간
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                반려동물
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                담당의
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                조회
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
                  진료 기록이 없습니다.
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
                      {r.doctorName}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex text-xs px-2 py-1 rounded-full ${
                          r.id !== undefined
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {r.id !== undefined ? "진료완료" : "진료전"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {r.id !== undefined ? (
                        <button
                          onClick={() => handleClick(r)}
                          className="flex items-center gap-1 text-sm px-3 py-1 rounded-md transition text-gray-700 bg-gray-100 hover:bg-gray-200"
                        >
                          <Eye size={16} /> 진료기록 조회
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">
                          진료 대기중
                        </span>
                      )}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
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

      {showDetail && selectedRecord && (
        <ChartDetailModal
          onClose={handleCloseModal}
          userRole="ROLE_ADMIN"
          record={{
            petName: selectedRecord.petName,
            weight: selectedRecord.weight || 0,
            age: selectedRecord.age || 0,
            diagnosis: selectedRecord.diagnosis || "",
            treatment: selectedRecord.treatment || "",
            surgery: selectedRecord.surgery
              ? {
                  surgeryName: selectedRecord.surgery.surgeryName || "",
                  surgeryDate: selectedRecord.surgery.surgeryDate || "",
                  anesthesiaType: selectedRecord.surgery.anesthesiaType || "",
                  surgeryNote: selectedRecord.surgery.surgeryNote || "",
                  resultUrl: selectedRecord.surgery.resultUrl,
                }
              : undefined,
            hospitalization: selectedRecord.hospitalization
              ? {
                  admissionDate:
                    selectedRecord.hospitalization.admissionDate || "",
                  dischargeDate:
                    selectedRecord.hospitalization.dischargeDate || "",
                  reason: selectedRecord.hospitalization.reason || "",
                  imageUrl: selectedRecord.hospitalization.imageUrl,
                }
              : undefined,
            checkups:
              selectedRecord.checkups?.map((checkup) => ({
                checkupType: checkup.checkupType || "",
                checkupDate: checkup.checkupDate || "",
                result: checkup.result || "",
                resultUrl: checkup.resultUrl,
              })) || [],
            doctorName: selectedRecord.doctorName,
            userName: selectedRecord.userName,
            reservationDate: selectedRecord.reservationDate,
            reservationTime: selectedRecord.reservationTime,
          }}
        />
      )}
    </div>
  );
}
