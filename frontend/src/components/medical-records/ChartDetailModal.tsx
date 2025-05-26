"use client";

import { useEffect, useState } from "react";

interface ChartDetailModalProps {
  onClose: () => void;
  record: {
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
  };
}

export default function ChartDetailModal({
  onClose,
  record,
}: ChartDetailModalProps) {
  const [hospitalImageUrl, setHospitalImageUrl] = useState<string | null>(null);
  const [checkupImageUrls, setCheckupImageUrls] = useState<(string | null)[]>(
    []
  );

  useEffect(() => {
    const fetchCheckupUrls = async () => {
      if (!record.checkups) return;

      const fetchUrls = await Promise.all(
        record.checkups.map(async (checkup) => {
          if (!checkup.resultUrl) return null;
          const s3Key = checkup.resultUrl.split(".com/")[1];
          if (!s3Key) return null;

          try {
            const res = await fetch(
              `${
                process.env.NEXT_PUBLIC_API_BASE_URL
              }/api/s3/presigned-url/view?s3Key=${encodeURIComponent(s3Key)}`
            );
            if (!res.ok) throw new Error("서버 응답 오류");
            const data = await res.json();
            return data.url;
          } catch (err) {
            console.error("📛 검사 이미지 presigned URL 조회 실패:", err);
            return null;
          }
        })
      );

      setCheckupImageUrls(fetchUrls);
    };

    fetchCheckupUrls();
  }, [record.checkups]);

  // 입원 사진 S3 프리사인 URL 발급
  useEffect(() => {
    const originalUrl = record.hospitalization?.imageUrl;
    if (!originalUrl) return;

    const s3Key = originalUrl.split(".com/")[1];
    if (!s3Key) return;

    fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL
      }/api/s3/presigned-url/view?s3Key=${encodeURIComponent(s3Key)}`
    )
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text(); // 실제 응답 확인
          console.error("❌ 응답 에러 본문:", text);
          throw new Error(`서버 오류 상태: ${res.status}`);
        }
        return res.json(); // 여기는 안전한 JSON 응답일 때만 실행
      })
      .then((data) => {
        console.log("✅ presigned GET URL:", data.url);
        setHospitalImageUrl(data.url);
      })
      .catch((err) => {
        console.error("📛 입원 이미지 presigned URL 조회 실패:", err);
      });
  }, [record.hospitalization?.imageUrl]);

  const formattedDate = record.reservationDate
    ? new Date(record.reservationDate).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const formattedTime = record.reservationTime
    ? record.reservationTime.split(":").slice(0, 2).join(":")
    : "";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-12 relative max-h-[90vh] overflow-y-auto animate-fadeIn">
        <button
          className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 text-3xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-8">진료기록 상세</h2>

        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">담당의</label>
            <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
              {record.doctorName || "담당의 미지정"}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">진료일</label>
            <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
              {formattedDate} {formattedTime}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              보호자 이름
            </label>
            <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
              {record.userName || "보호자 미지정"}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              반려동물 이름
            </label>
            <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
              {record.petName}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">체중</label>
            <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
              {record.weight ? `${record.weight} kg` : "-"}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">나이</label>
            <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
              {record.age ? `${record.age}세` : "-"}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs text-gray-500 mb-1">진단 내용</label>
          <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700 min-h-[100px]">
            {record.diagnosis || "-"}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-xs text-gray-500 mb-1">치료 내용</label>
          <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700 min-h-[100px]">
            {record.treatment || "-"}
          </div>
        </div>

        {/* 검사 기록 */}
        {record.checkups && record.checkups.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">
              검사 기록
            </h3>
            <div className="space-y-4">
              {record.checkups.map((checkup, index) => (
                <div key={index} className="bg-gray-50 rounded p-4">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        검사 종류
                      </label>
                      <div className="bg-white border border-gray-300 rounded px-3 py-2">
                        {checkup.checkupType || "-"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        검사일
                      </label>
                      <div className="bg-white border border-gray-300 rounded px-3 py-2">
                        {checkup.checkupDate || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs text-gray-500 mb-1">
                      검사 결과
                    </label>
                    <div className="bg-white border border-gray-300 rounded px-3 py-2 min-h-[60px]">
                      {checkup.result || "-"}
                    </div>
                  </div>
                  {checkupImageUrls[index] && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        검사 파일
                      </label>
                      <img
                        src={checkupImageUrls[index]!}
                        alt="검사 결과 이미지"
                        className="mt-2 max-h-32 rounded"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 수술 기록 */}
        {record.surgery && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">
              수술 기록
            </h3>
            <div className="bg-gray-50 rounded p-4">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    수술명
                  </label>
                  <div className="bg-white border border-gray-300 rounded px-3 py-2">
                    {record.surgery.surgeryName || "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    수술일
                  </label>
                  <div className="bg-white border border-gray-300 rounded px-3 py-2">
                    {record.surgery.surgeryDate || "-"}
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">
                  마취 종류
                </label>
                <div className="bg-white border border-gray-300 rounded px-3 py-2">
                  {record.surgery.anesthesiaType || "-"}
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">
                  수술 내용
                </label>
                <div className="bg-white border border-gray-300 rounded px-3 py-2 min-h-[60px]">
                  {record.surgery.surgeryNote || "-"}
                </div>
              </div>
              {record.surgery.resultUrl && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    수술 결과 파일
                  </label>
                  <a
                    href={record.surgery.resultUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 text-sm"
                  >
                    파일 보기
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 입원 기록 */}
        {record.hospitalization && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">
              입원 기록
            </h3>
            <div className="bg-gray-50 rounded p-4">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    입원일
                  </label>
                  <div className="bg-white border border-gray-300 rounded px-3 py-2">
                    {record.hospitalization.admissionDate || "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    퇴원일
                  </label>
                  <div className="bg-white border border-gray-300 rounded px-3 py-2">
                    {record.hospitalization.dischargeDate || "-"}
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">
                  입원 사유
                </label>
                <div className="bg-white border border-gray-300 rounded px-3 py-2 min-h-[60px]">
                  {record.hospitalization.reason || "-"}
                </div>
              </div>
              {hospitalImageUrl && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    입원 사진
                  </label>
                  <img
                    src={hospitalImageUrl}
                    alt="입원 사진"
                    className="mt-2 max-h-32 rounded"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded bg-gray-100 text-gray-700 text-lg hover:bg-gray-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
