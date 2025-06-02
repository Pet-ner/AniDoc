"use client";

import { Edit2, Search, Eye, Syringe } from "lucide-react";
import { useEffect, useState } from "react";
import ChartModal from "./ChartModal";
import ChartDetailModal from "./ChartDetailModal";
import VaccinationModal from "./VaccinationModal";
import VaccinationDetailModal from "./VaccinationDetailModal";
import { toast } from "react-hot-toast";

interface MedicalRecord {
  id: number;
  reservationTime: string;
  petName: string;
  petSpecies: string;
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
    id: number;
    surgeryName: string;
    surgeryDate: string;
    anesthesiaType: string;
    surgeryNote: string;
    resultUrl?: string;
  };
  hospitalization?: {
    id: number;
    admissionDate: string;
    dischargeDate: string;
    reason: string;
    imageUrl?: string;
  };
  checkups?: {
    id: number;
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
  type?: "GENERAL" | "VACCINATION";
  hasVaccinationRecord?: boolean; // 예방접종 기록 존재 여부
  vaccinationStatus?: string;
}

interface StaffMedicalRecordProps {
  records: MedicalRecord[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  onOpenChart: (record: MedicalRecord) => void;
  userId: number;
}

export default function StaffMedicalRecord({
  records,
  loading,
  search,
  setSearch,
  onOpenChart,
  userId,
}: StaffMedicalRecordProps) {
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [showDetail, setShowDetail] = useState(false);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [showVaccinationDetail, setShowVaccinationDetail] = useState(false);
  const [selectedVaccinationData, setSelectedVaccinationData] =
    useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {}, [records]);

  const [isChartModalOpen, setChartModalOpen] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleClick = async (record: MedicalRecord) => {
    if (record.type === "VACCINATION") {
      // 예방접종 기록 처리
      if (record.hasVaccinationRecord) {
        // 예방접종 기록 조회
        await handleViewVaccinationRecord(record);
      } else {
        // 예방접종 기록 작성
        setSelectedRecord(record);
        setShowVaccinationModal(true);
      }
    } else {
      // 일반 진료 기록 처리
      if (record.hasMedicalRecord) {
        // 진료 기록 조회
        await handleViewMedicalRecord(record);
      } else {
        // 진료 기록 작성
        setSelectedRecord(record);
        onOpenChart(record);
      }
    }
  };

  const handleViewMedicalRecord = async (record: MedicalRecord) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records/by-reservation/${record.id}?userId=${record.userId}`,
        {
          credentials: "include",
        }
      );
      const responseBody = await res.json();
      const medicalRecord = responseBody.medicalRecord;

      if (!medicalRecord) {
        toast.error("진료기록을 찾을 수 없습니다.");
        return;
      }

      const updatedRecord = {
        ...record,
        id: medicalRecord.id,
        reservationId: record.id,
        weight: medicalRecord.currentWeight,
        age: medicalRecord.age,
        diagnosis: medicalRecord.diagnosis,
        treatment: medicalRecord.treatment,
        surgery: medicalRecord.surgery,
        hospitalization: medicalRecord.hospitalization,
        checkups: medicalRecord.checkups,
        hasMedicalRecord: true,
        petId: medicalRecord.petId ?? record.petId,
      };

      setSelectedRecord(updatedRecord);
      setShowDetail(true);
    } catch (err) {
      console.error("진료기록 조회 실패", err);
      toast.error("진료기록을 불러오는 데 실패했습니다.");
    }
  };

  const handleViewVaccinationRecord = async (record: MedicalRecord) => {
    try {
      // 예방접종 기록 조회 API 호출
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctor/vaccines/reservation/${record.id}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("예방접종 기록을 찾을 수 없습니다.");
      }

      const vaccinationData = await res.json();

      // 예방접종 기록 상세 모달 표시 (별도 모달 사용)
      setSelectedRecord(record);
      setSelectedVaccinationData(vaccinationData);
      setShowVaccinationDetail(true);
    } catch (err) {
      console.error("예방접종 기록 조회 실패", err);
      toast.error("예방접종 기록을 불러오는 데 실패했습니다.");
    }
  };

  const handleSaved = async (
    newMedicalRecordId: number,
    reservationId: number
  ) => {
    if (!selectedRecord) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records/by-reservation/${selectedRecord.reservationId}?userId=${selectedRecord.userId}`,
        { credentials: "include" }
      );

      const responseBody = await res.json();
      const newMedicalRecordData = responseBody.medicalRecord;

      if (!newMedicalRecordData) {
        return;
      }

      // 모든 필드를 명시적으로 매핑
      const updatedRecord = {
        ...selectedRecord,
        weight: newMedicalRecordData.currentWeight ?? 0,
        age: newMedicalRecordData.age ?? 0,
        diagnosis: newMedicalRecordData.diagnosis ?? "",
        treatment: newMedicalRecordData.treatment ?? "",
        surgery: newMedicalRecordData.surgery
          ? {
              id: newMedicalRecordData.surgery.id,
              surgeryName: newMedicalRecordData.surgery.surgeryName ?? "",
              surgeryDate: newMedicalRecordData.surgery.surgeryDate ?? "",
              anesthesiaType: newMedicalRecordData.surgery.anesthesiaType ?? "",
              surgeryNote: newMedicalRecordData.surgery.surgeryNote ?? "",
              resultUrl: newMedicalRecordData.surgery.resultUrl,
            }
          : undefined,
        hospitalization: newMedicalRecordData.hospitalization
          ? {
              id: newMedicalRecordData.hospitalization.id,
              admissionDate:
                newMedicalRecordData.hospitalization.admissionDate ?? "",
              dischargeDate:
                newMedicalRecordData.hospitalization.dischargeDate ?? "",
              reason: newMedicalRecordData.hospitalization.reason ?? "",
              imageUrl: newMedicalRecordData.hospitalization.imageUrl,
            }
          : undefined,
        checkups:
          newMedicalRecordData.checkups?.map(
            (checkup: {
              checkupType?: string;
              checkupDate?: string;
              result?: string;
              resultUrl?: string;
            }) => ({
              id: newMedicalRecordData.checkup.id,
              checkupType: checkup.checkupType ?? "",
              checkupDate: checkup.checkupDate ?? "",
              result: checkup.result ?? "",
              resultUrl: checkup.resultUrl,
            })
          ) ?? [],
        doctorName:
          newMedicalRecordData.doctorName ?? selectedRecord.doctorName,
        petName: newMedicalRecordData.petName ?? selectedRecord.petName,
        hasMedicalRecord: true,
      };

      // selectedRecord 업데이트
      setSelectedRecord(updatedRecord);

      // 부모 컴포넌트의 records 업데이트를 위해 onOpenChart 호출
      onOpenChart(updatedRecord);

      setShowDetail(true);
      setChartModalOpen(false);
    } catch (err) {}
  };

  const handleVaccinationSaved = async () => {
    // 예방접종 기록 저장 후 처리
    if (selectedRecord) {
      const updatedRecord = {
        ...selectedRecord,
        hasVaccinationRecord: true,
      };
      setSelectedRecord(updatedRecord);
      onOpenChart(updatedRecord);
    }
    setShowVaccinationModal(false);
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
    setShowDetail(false);
    setChartModalOpen(false);
    setShowVaccinationModal(false);
    setShowVaccinationDetail(false);
    setSelectedVaccinationData(null);
  };

  const getVaccinationStatusText = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return "미접종";
      case "IN_PROGRESS":
        return "접종진행중";
      case "COMPLETED":
        return "접종완료";
      default:
        return "진료전";
    }
  };

  const getVaccinationStatusColor = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getActionButton = (record: MedicalRecord) => {
    if (record.type === "VACCINATION") {
      if (record.hasVaccinationRecord) {
        return (
          <button
            onClick={() => handleClick(record)}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-md transition text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            <Eye size={16} /> 백신기록 조회
          </button>
        );
      } else {
        return (
          <button
            onClick={() => handleClick(record)}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-md transition text-white bg-[#49BEB7] hover:bg-[#3ea9a2]"
          >
            <Syringe size={16} /> 백신기록 작성
          </button>
        );
      }
    } else {
      if (record.hasMedicalRecord) {
        return (
          <button
            onClick={() => handleClick(record)}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-md transition text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            <Eye size={16} /> 진료기록 조회
          </button>
        );
      } else {
        return (
          <button
            onClick={() => handleClick(record)}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-md transition text-white bg-[#49BEB7] hover:bg-[#3ea9a2]"
          >
            <Edit2 size={16} /> 진료기록 작성
          </button>
        );
      }
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
              placeholder="환자 검색"
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
                환자명
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                진료 유형
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                증상
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                진료 담당
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
                  로딩 중...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
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
                      {r.reservationTime
                        ? r.reservationTime.substring(0, 5)
                        : ""}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#49BEB7] font-medium">
                      {r.petName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          r.type === "GENERAL"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {r.type === "GENERAL" ? "일반진료" : "예방접종"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.symptom}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.doctorName}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex text-xs px-2 py-1 rounded-full ${
                          r.type === "VACCINATION" &&
                          r.hasVaccinationRecord &&
                          r.vaccinationStatus
                            ? getVaccinationStatusColor(r.vaccinationStatus) // 예방접종 상태별 색상
                            : (r.type === "GENERAL" && r.hasMedicalRecord) ||
                              (r.type === "VACCINATION" &&
                                r.hasVaccinationRecord)
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {r.type === "VACCINATION" &&
                        r.hasVaccinationRecord &&
                        r.vaccinationStatus
                          ? getVaccinationStatusText(r.vaccinationStatus) // 예방접종 상태 텍스트
                          : (r.type === "GENERAL" && r.hasMedicalRecord) ||
                            (r.type === "VACCINATION" && r.hasVaccinationRecord)
                          ? "진료완료"
                          : "진료전"}
                      </span>
                    </td>
                    <td className="px-4 py-4">{getActionButton(r)}</td>
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

      {showDetail && selectedRecord && (
        <ChartDetailModal
          onClose={handleCloseModal}
          userRole="ROLE_STAFF"
          record={{
            id: selectedRecord.id,
            reservationId: selectedRecord.reservationId,
            userId: selectedRecord.userId,
            doctorId: selectedRecord.doctorId,
            petName: selectedRecord.petName,
            weight: selectedRecord.weight || 0,
            age: selectedRecord.age || 0,
            diagnosis: selectedRecord.diagnosis || "",
            treatment: selectedRecord.treatment || "",
            surgery: selectedRecord.surgery
              ? {
                  id: selectedRecord.surgery.id,
                  surgeryName: selectedRecord.surgery.surgeryName || "",
                  surgeryDate: selectedRecord.surgery.surgeryDate || "",
                  anesthesiaType: selectedRecord.surgery.anesthesiaType || "",
                  surgeryNote: selectedRecord.surgery.surgeryNote || "",
                  resultUrl: selectedRecord.surgery.resultUrl,
                }
              : undefined,
            hospitalization: selectedRecord.hospitalization
              ? {
                  id: selectedRecord.hospitalization.id,
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
                id: checkup.id,
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

      {isChartModalOpen && selectedRecord && (
        <ChartModal
          onClose={handleCloseModal}
          record={selectedRecord}
          currentUserId={selectedRecord.doctorId || 0}
          mode={selectedRecord.hasMedicalRecord ? "edit" : "create"}
          onSaved={(id, reservationId) => handleSaved(id, reservationId)}
        />
      )}

      {showVaccinationModal && selectedRecord && (
        <VaccinationModal
          onClose={handleCloseModal}
          record={selectedRecord}
          onSaved={handleVaccinationSaved}
        />
      )}

      {showVaccinationDetail && selectedVaccinationData && (
        <VaccinationDetailModal
          onClose={handleCloseModal}
          vaccinationData={selectedVaccinationData}
          reservationData={{
            reservationId: selectedRecord?.id,
            doctorId: selectedRecord?.doctorId,
          }}
          userRole="ROLE_STAFF"
          onUpdate={(updatedData) => {
            setSelectedVaccinationData(updatedData);
          }}
        />
      )}
    </div>
  );
}
