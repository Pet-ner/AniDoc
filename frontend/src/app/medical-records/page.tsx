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

                const errorBody = await detailRes.text();
                console.error(">>> 상세 정보 fetch 실패: 응답 본문", errorBody);
                throw new Error(`HTTP error! status: ${detailRes.status}`);
              }
              const detailData = await detailRes.json();

              const medicalRecordDetails = detailData.medicalRecord;

              if (medicalRecordDetails) {
                return {
                  ...record,
                  age: medicalRecordDetails.age,
                  weight: medicalRecordDetails.currentWeight,
                  diagnosis: medicalRecordDetails.diagnosis,
                  treatment: medicalRecordDetails.treatment,
                  isSurgery: medicalRecordDetails.isSurgery,
                  isHospitalized: medicalRecordDetails.isHospitalized,
                  isCheckedUp: medicalRecordDetails.isCheckedUp,
                };
              } else {
                console.error(
                  "상세 진료기록 응답 구조 오류 또는 데이터 없음",
                  detailData
                );
                return record;
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
  };

  return (
    <div className="space-y-6">
      {/* 중앙 정렬된 MedicalRecord 컴포넌트 */}
      <div className="w-full">
        {user?.userRole === "ROLE_STAFF" ? (
          <StaffMedicalRecord
            records={records}
            loading={loading}
            search={search}
            setSearch={setSearch}
            onOpenChart={(r) => {
              setSelectedRecord(r);
              setOpenChartModal(true);
              setRecords((prevRecords) =>
                prevRecords.map((record) =>
                  record.id === r.id
                    ? { ...record, hasMedicalRecord: r.hasMedicalRecord }
                    : record
                )
              );
            }}
            userId={user.id}
          />
        ) : user?.userRole === "ROLE_USER" ? (
          <UserMedicalRecord
            userId={user.id}
            search={search}
            setSearch={setSearch}
          />
        ) : null}
      </div>

      {user?.userRole === "ROLE_STAFF" && openChartModal && selectedRecord && (
        <ChartModal
          onClose={handleChartModalClose}
          record={selectedRecord}
          currentUserId={user.id}
          onSaved={(id, reservationId) => {
            setRecords((prevRecords) => {
              const updatedRecords = prevRecords.map((record) =>
                record.id === selectedRecord.id
                  ? { ...record, hasMedicalRecord: true }
                  : record
              );
              return updatedRecords;
            });

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
