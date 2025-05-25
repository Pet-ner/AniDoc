"use client";

import React, { useState } from "react";

interface Props {
  onSubmit: (formData: any) => void;
}

const NewHospitalizationRecord: React.FC<Props> = ({ onSubmit }) => {
  const [admissionDate, setAdmissionDate] = useState("");
  const [expectedDischargeDate, setExpectedDischargeDate] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);

      // ✅ 1. Presigned URL 요청
      const folder = "HOSPITALIZATION";
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/s3/presigned-url?s3Folder=${folder}&fileName=${encodeURIComponent(
          file.name
        )}&contentType=${encodeURIComponent(file.type)}`
      );
      const { url: presignedUrl } = await res.json();
      console.log("Presigned URL:", presignedUrl);

      // ✅ 2. S3에 이미지 업로드
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("S3 업로드 실패");
      }

      // ✅ 3. 서버에 저장할 실제 URL (query string 제거)
      const objectKey = presignedUrl.split(".com/")[1]?.split("?")[0];
      const finalUrl = `https://anidoc-bucket.s3.ap-northeast-2.amazonaws.com/${objectKey}`;
      setImageUrl(finalUrl); // ❗ 제출용 URL 저장

      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const data = {
      admissionDate,
      expectedDischargeDate,
      reason,
      status,
      imageUrl,
    };
    onSubmit(data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        {/* 제목 */}
        <div className="bg-teal-50 px-6 py-4 border-b border-teal-100">
          <h2 className="text-lg font-medium text-teal-700">입원 기록 작성</h2>
        </div>

        {/* 폼 본문 */}
        <div className="p-6 space-y-6">
          {/* 입원 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              입원 날짜
            </label>
            <input
              type="date"
              value={admissionDate}
              onChange={(e) => setAdmissionDate(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          {/* 퇴원 예정일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              퇴원 예정일
            </label>
            <input
              type="date"
              value={expectedDischargeDate}
              onChange={(e) => setExpectedDischargeDate(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          {/* 입원 사유 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              입원 사유
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
              placeholder="입원 사유를 입력해주세요"
            />
          </div>

          {/* 반려동물 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              반려동물 상태
            </label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
              placeholder="입원 당시 반려동물 상태"
            />
          </div>

          {/* 입원 당시 사진 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              입원 당시 사진
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
            {previewUrl && (
              <div className="mt-3">
                <img
                  src={previewUrl}
                  alt="입원 사진"
                  className="w-48 h-auto rounded shadow-md"
                />
              </div>
            )}
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? "처리 중..." : "제출"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewHospitalizationRecord;
