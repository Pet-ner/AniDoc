"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import {
  Calendar,
  UserCheck,
  CheckCircle,
  FilePlus,
} from "lucide-react";
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
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchRecords = async () => {
      try {
        setLoading(true);
        let endpoint = "";
        if (user.userRole === "ROLE_STAFF") {
          endpoint = `/api/reservations/approved?doctorId=${user.id}`;
        } else if (user.userRole === "ROLE_USER") {
          endpoint = `/api/medical-records/mine?userId=${user.id}`;
        } else {
          router.push("/");
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
          credentials: "include",
        });

        const data = await res.json();
        setRecords(Array.isArray(data) ? data : data.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="오늘의 예약" value={0} icon={<Calendar size={20} className="text-teal-500" />} bg="bg-teal-50" />
        <StatCard title="대기 중" value={0} icon={<UserCheck size={20} className="text-blue-500" />} bg="bg-blue-50" />
        <StatCard title="완료된 진료" value={0} icon={<CheckCircle size={20} className="text-purple-500" />} bg="bg-purple-50" />
        <StatCard title="신규 차트 발행" value={0} icon={<FilePlus size={20} className="text-amber-500" />} bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          {user?.userRole === "ROLE_STAFF" ? (
            <StaffMedicalRecord
              records={records}
              loading={loading}
              search={search}
              setSearch={setSearch}
              onOpenChart={(r) => {
                setSelectedRecord(r);
                setOpenChartModal(true);
              }}
            />
          ) : user?.userRole === "ROLE_USER" ? (
            <UserMedicalRecord
              records={records}
              loading={loading}
              search={search}
              setSearch={setSearch}
            />
          ) : null}
        </div>
      </div>

      {user?.userRole === "ROLE_STAFF" && openChartModal && selectedRecord && (
        <ChartModal
          onClose={() => {
            setOpenChartModal(false);
            setSelectedRecord(null);
          }}
          userId={selectedRecord.userId}
          reservationId={selectedRecord.reservationId}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, bg }: { title: string; value: number; icon: React.ReactNode; bg: string }) {
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
