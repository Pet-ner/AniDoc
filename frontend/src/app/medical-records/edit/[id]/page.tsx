"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface MedicalRecord {
  id: number;
  userId: number;
  petName: string;
  weight?: number;
  age?: number;
  diagnosis?: string;
  treatment?: string;
  surgery?: {
    surgeryName?: string;
    surgeryDate?: string;
    anesthesiaType?: string;
    surgeryNote?: string;
    resultUrl?: string;
  };
  hospitalization?: {
    admissionDate?: string;
    dischargeDate?: string;
    reason?: string;
    imageUrl?: string;
  };
  checkups?: {
    checkupType?: string;
    checkupDate?: string;
    result?: string;
    resultUrl?: string;
  }[];
  doctorName: string;
  userName?: string;
  reservationDate?: string;
  reservationTime: string;
}

export default function EditMedicalRecordPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("로그인이 필요합니다.");
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch record");
        const data = await response.json();
        setRecord(data);
      } catch (error) {
        toast.error("진료기록을 불러오는데 실패했습니다.");
        router.push("/medical-records");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecord();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records/${params.id}?userId=${record.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(record),
        }
      );

      if (!response.ok) throw new Error("Failed to update record");

      toast.success("진료기록이 수정되었습니다.");
      router.push("/medical-records");
    } catch (error) {
      toast.error("진료기록 수정 중 오류가 발생했습니다.");
      console.error("Update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">진료기록을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">진료기록 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              반려동물 이름
            </label>
            <input
              type="text"
              value={record.petName}
              onChange={(e) =>
                setRecord({ ...record, petName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              체중 (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={record.weight || ""}
              onChange={(e) =>
                setRecord({ ...record, weight: parseFloat(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            진단 내용
          </label>
          <textarea
            value={record.diagnosis || ""}
            onChange={(e) =>
              setRecord({ ...record, diagnosis: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            치료 내용
          </label>
          <textarea
            value={record.treatment || ""}
            onChange={(e) =>
              setRecord({ ...record, treatment: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded bg-gray-100 text-gray-700 text-lg hover:bg-gray-200"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`px-6 py-3 rounded bg-teal-600 text-white text-lg hover:bg-teal-700 ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSaving ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
