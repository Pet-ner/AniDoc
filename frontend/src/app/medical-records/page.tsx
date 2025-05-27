"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Calendar, UserCheck, CheckCircle, FilePlus } from "lucide-react";
import ChartModal from "@/components/medical-records/ChartModal";
import StaffMedicalRecord from "@/components/medical-records/StaffMedicalRecord";
import UserMedicalRecord from "@/components/medical-records/UserMedicalRecord";

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
}

interface Stats {
  todayAppointments: number;
  waitingPatients: number;
  completedTreatments: number;
  newCharts: number;
}

export default function MedicalRecordPage() {
  const router = useRouter();
  const { user } = useUser();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openChartModal, setOpenChartModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );

  const fetchRecords = async () => {
    if (!user) return;
    try {
      setLoading(true);
      let endpoint = "";
      if (user.userRole === "ROLE_STAFF") {
        endpoint = `/api/reservations/approved?doctorId=${user.id}`;
      } else if (user.userRole === "ROLE_USER") {
        endpoint = `/api/medical-records/by-user/${user.id}`;
      } else {
        router.push("/");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();
      const records = Array.isArray(data) ? data : data.content || [];

      // 진료 기록이 있는 경우 상세 정보를 가져옵니다
      const recordsWithDetails = await Promise.all(
        records.map(async (record: MedicalRecord) => {
          if (
            record.hasMedicalRecord &&
            record.reservationId !== undefined &&
            record.reservationId !== null
          ) {
            try {
              const detailRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records/${record.id}?userId=${user.id}`,
                {
                  credentials: "include",
                }
              );
              if (!detailRes.ok) {
                console.error(
                  ">>> 상세 정보 fetch 실패: 응답 상태",
                  detailRes.status,
                  detailRes.statusText
                );
                // Attempt to read error body for more details, but don't throw yet
                const errorBody = await detailRes.text();
                console.error(">>> 상세 정보 fetch 실패: 응답 본문", errorBody);
                throw new Error(`HTTP error! status: ${detailRes.status}`); // <-- 여기서 catch로 넘어갑니다.
              }
              const detailData = await detailRes.json();

              // 백엔드 컨트롤러에 맞춰 medicalRecordId로 호출하도록 수정
              const medicalRecordDetails = detailData.medicalRecord; // 'medicalRecord' 키 안의 객체를 가져옵니다。

              // medicalRecordDetails 객체가 존재하고 유효한지 확인
              if (medicalRecordDetails) {
                // 기존 record 정보에 상세 조회에서 가져온 필드들을 병합합니다.
                return {
                  ...record, // 기존 record의 모든 필드 (예: reservationId, hasMedicalRecord 등) 유지
                  // MedicalRecordResponseDto의 필드를 MedicalRecord 인터페이스에 맞게 매핑
                  age: medicalRecordDetails.age,
                  weight: medicalRecordDetails.currentWeight, // 백엔드 currentWeight -> 프론트 weight
                  diagnosis: medicalRecordDetails.diagnosis,
                  treatment: medicalRecordDetails.treatment,
                  // isSurgery, isHospitalized, isCheckedUp 등 필요한 다른 필드도 여기서 병합 가능
                  isSurgery: medicalRecordDetails.isSurgery,
                  isHospitalized: medicalRecordDetails.isHospitalized,
                  isCheckedUp: medicalRecordDetails.isCheckedUp,
                  // 상세 기록 객체 (surgery, hospitalization, checkups)는 응답에 없으므로 여기서 병합하지 않습니다.
                  // 이것이 필요한 경우 백엔드 수정 또는 프론트 추가 호출이 필요합니다.
                };
              } else {
                // detailData.medicalRecord 가 없는 경우 (예: 응답 구조가 예상과 다름)
                console.error(
                  "상세 진료기록 응답 구조 오류 또는 데이터 없음",
                  detailData
                );
                return record; // 상세 정보 없이 기존 record 반환
              }
            } catch (err) {
              console.error(">>> 상세 정보 fetch 중 에러 발생:", err);
              return record;
            }
          }
          return record;
        })
      );

      setRecords(recordsWithDetails);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const handleChartModalClose = () => {
    setOpenChartModal(false);
    setSelectedRecord(null);
    // 저장 후에는 fetchRecords를 호출하지 않음
  };

  return (
    <div className="space-y-6">
      {/* 중앙 정렬된 MedicalRecord 컴포넌트 */}
      <div className="flex justify-center w-full">
        <div className="w-full max-w-7xl">
          {user?.userRole === "ROLE_STAFF" ? (
            <StaffMedicalRecord
              records={records}
              loading={loading}
              search={search}
              setSearch={setSearch}
              onOpenChart={(r) => {
                console.log("📝 onOpenChart called with record:", r);
                setSelectedRecord(r);
                setOpenChartModal(true);
                // records 상태를 즉시 업데이트
                setRecords((prevRecords) =>
                  prevRecords.map((record) =>
                    record.id === r.id
                      ? { ...record, hasMedicalRecord: r.hasMedicalRecord }
                      : record
                  )
                );
              }}
            />
          ) : user?.userRole === "ROLE_USER" ? (
            <UserMedicalRecord
              userId={user.id}
              search={search}
              setSearch={setSearch}
            />
          ) : null}
        </div>
      </div>

      {user?.userRole === "ROLE_STAFF" && openChartModal && selectedRecord && (
        <ChartModal
          onClose={handleChartModalClose}
          record={selectedRecord}
          currentUserId={user.id}
          onSaved={(id, reservationId) => {
            console.log("📝 진료기록 저장 완료:", { id, reservationId });
            // records 배열에서 해당 예약의 hasMedicalRecord 상태 업데이트
            setRecords((prevRecords) => {
              console.log("📝 이전 records:", prevRecords);
              const updatedRecords = prevRecords.map((record) =>
                record.id === selectedRecord.id
                  ? { ...record, hasMedicalRecord: true }
                  : record
              );
              console.log("📝 업데이트된 records:", updatedRecords);
              return updatedRecords;
            });
            // 저장 후에는 fetchRecords를 호출하여 최신 데이터로 업데이트
            // fetchRecords();
            // 모달 닫기
            handleChartModalClose();
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  bg,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-lg shadow-sm p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
