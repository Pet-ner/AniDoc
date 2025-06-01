"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import ImageCropper from "./ImageCropper";

interface Pet {
  id: number;
  name: string;
  birth: string;
  gender: string;
  species: string;
  breed: string;
  weight: number;
  isNeutered: boolean;
  profileUrl?: string;
  lastDiroDate?: string;
  specialNote?: string;
}

interface PetRegistrationData {
  name: string;
  birth: string;
  gender: string;
  isNeutered: boolean;
  species: string;
  breed: string;
  weight: number;
  lastDiroDate: string;
  profileUrl: string;
  specialNote: string;
}

const GENDER_MAP = {
  수컷: "MALE",
  암컷: "FEMALE",
} as const;

interface PetRegistProps {
  petData?: Pet | null;
  onClose: () => void;
  isEditMode?: boolean;
}

const PetRegist: React.FC<PetRegistProps> = ({
  petData,
  onClose,
  isEditMode = false,
}) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [presignedImageUrl, setPresignedImageUrl] = useState<string>("");

  // 체중 입력을 위한 별도 상태
  const [weightInput, setWeightInput] = useState("");

  // 이미지 크롭 관련 상태
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState<string>("");

  // 폼 데이터 상태
  const [formData, setFormData] = useState<PetRegistrationData>({
    name: "",
    birth: "",
    gender: "",
    isNeutered: false,
    species: "",
    breed: "",
    weight: 0,
    lastDiroDate: "",
    profileUrl: "",
    specialNote: "",
  });

  // formData.weight 변경 시 weightInput 동기화
  useEffect(() => {
    if (formData.weight === 0) {
      setWeightInput("");
    } else {
      setWeightInput(formData.weight.toString());
    }
  }, [formData.weight]);

  // S3 Presigned URL 발급 함수
  const generatePresignedViewUrl = async (
    originalUrl: string
  ): Promise<string | null> => {
    try {
      let s3Key = originalUrl.split(".com/")[1];
      if (!s3Key) return null;

      s3Key = s3Key.split("?")[0];

      let decodedKey = s3Key;
      let previousKey = "";

      while (decodedKey !== previousKey && decodedKey.includes("%")) {
        previousKey = decodedKey;
        try {
          decodedKey = decodeURIComponent(decodedKey);
        } catch (e) {
          decodedKey = previousKey;
          break;
        }
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/s3/presigned-url/view?s3Key=${encodeURIComponent(decodedKey)}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    if (petData) {
      setFormData({
        name: petData.name || "",
        birth: formatDate(petData.birth) || "",
        gender: petData.gender === "MALE" ? "수컷" : "암컷",
        isNeutered: petData.isNeutered || false,
        species: petData.species || "",
        breed: petData.breed || "",
        weight: petData.weight || 0,
        lastDiroDate: formatDate(petData.lastDiroDate || "") || "",
        profileUrl: petData.profileUrl || "",
        specialNote: petData.specialNote || "",
      });

      if (petData.profileUrl) {
        setImageUrl(petData.profileUrl);
        generatePresignedViewUrl(petData.profileUrl).then((presignedUrl) => {
          if (presignedUrl) {
            setPresignedImageUrl(presignedUrl);
            setPreviewUrl(presignedUrl);
          } else {
            setPreviewUrl(petData.profileUrl || "");
          }
        });
      }
    }
  }, [petData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB 이하로 선택해주세요.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있습니다.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setSelectedImageForCrop(imageUrl);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      setLoading(true);
      setShowCropper(false);

      const timestamp = Date.now();
      const croppedFile = new File(
        [croppedImageBlob],
        `cropped-pet-${timestamp}.jpg`,
        {
          type: "image/jpeg",
        }
      );

      console.log("크롭된 파일 크기:", croppedFile.size, "bytes");

      const folder = "PROFILE_IMAGES";
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/s3/presigned-url?s3Folder=${folder}&fileName=${encodeURIComponent(
          croppedFile.name
        )}&contentType=${encodeURIComponent(croppedFile.type)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Presigned URL 발급 실패");
      }

      const { url: presignedUrl } = await response.json();

      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": croppedFile.type,
        },
        body: croppedFile,
      });

      if (!uploadResponse.ok) {
        throw new Error("S3 업로드 실패");
      }

      const objectKey = presignedUrl.split(".com/")[1]?.split("?")[0];
      const finalUrl = `https://anidoc-bucket.s3.ap-northeast-2.amazonaws.com/${objectKey}`;
      setImageUrl(finalUrl);

      const localPreviewUrl = URL.createObjectURL(croppedImageBlob);
      setPreviewUrl(localPreviewUrl);
      setPresignedImageUrl(localPreviewUrl);

      console.log("이미지 업로드 완료:", finalUrl);
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      if (selectedImageForCrop) {
        URL.revokeObjectURL(selectedImageForCrop);
        setSelectedImageForCrop("");
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (selectedImageForCrop) {
      URL.revokeObjectURL(selectedImageForCrop);
      setSelectedImageForCrop("");
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      if (selectedImageForCrop) {
        URL.revokeObjectURL(selectedImageForCrop);
      }
    };
  }, [previewUrl, selectedImageForCrop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (
        !formData.name ||
        !formData.birth ||
        !formData.gender ||
        !formData.species
      ) {
        throw new Error("필수 항목을 모두 입력해주세요.");
      }

      const petRequestData = {
        ...formData,
        gender: GENDER_MAP[formData.gender as keyof typeof GENDER_MAP],
        profileUrl: imageUrl || null,
        weight: parseFloat(formData.weight.toString()),
        birth: new Date(formData.birth).toISOString().split("T")[0],
        lastDiroDate: formData.lastDiroDate
          ? new Date(formData.lastDiroDate).toISOString().split("T")[0]
          : null,
        isNeutered: Boolean(formData.isNeutered),
      };

      const url = petData
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pets/${petData.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pets/petreg`;

      const response = await fetch(url, {
        method: petData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(petRequestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          typeof errorData === "string"
            ? errorData
            : errorData.message ||
              `반려동물 ${petData ? "수정" : "등록"}에 실패했습니다.`
        );
      }

      alert(`반려동물이 성공적으로 ${petData ? "수정" : "등록"}되었습니다.`);
      onClose();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : `반려동물 ${petData ? "수정" : "등록"} 중 오류가 발생했습니다.`
      );
    }
  };

  const formatDate = (date: string) => {
    if (!date) return null;
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return null;
    }
  };

  const handleImageRemove = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setImageUrl("");
    setPresignedImageUrl("");
  };

  return (
    <>
      <div className="w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="반려동물 이름을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  생년월일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="birth"
                  value={formData.birth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  성별 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="수컷"
                      checked={formData.gender === "수컷"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-teal-500 border-gray-300 focus:ring-teal-500"
                      required
                    />
                    <span className="ml-2">수컷</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="암컷"
                      checked={formData.gender === "암컷"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-teal-500 border-gray-300 focus:ring-teal-500"
                    />
                    <span className="ml-2">암컷</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  중성화 여부
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isNeutered"
                    checked={formData.isNeutered}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="ml-2">중성화 완료</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종류 <span className="text-red-500">*</span>
                </label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">동물의 종류를 선택하세요</option>
                  <option value="강아지">강아지</option>
                  <option value="고양이">고양이</option>
                  <option value="고슴도치">고슴도치</option>
                  <option value="햄스터">햄스터</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  품종
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="품종을 입력하세요 (예: 말티즈, 페르시안 등)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  체중 (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="weight"
                  value={weightInput}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "") {
                      setWeightInput("");
                      setFormData((prev) => ({ ...prev, weight: 0 }));
                      return;
                    }

                    // 0.1, 0.2 등의 입력을 정확히 처리
                    if (/^[0-9]*\.?[0-9]{0,1}$/.test(value)) {
                      setWeightInput(value);
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        setFormData((prev) => ({ ...prev, weight: numValue }));
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    const allowedKeys = [
                      "Backspace",
                      "Delete",
                      "Tab",
                      "Escape",
                      "Enter",
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                      "Home",
                      "End",
                    ];

                    if (
                      allowedKeys.includes(e.key) ||
                      (e.key >= "0" && e.key <= "9") ||
                      (e.key === "." && !e.currentTarget.value.includes("."))
                    ) {
                      return;
                    }

                    e.preventDefault();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="체중을 입력하세요 (예: 0.1, 4.3)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  마지막 심장사상충 약 투여일
                </label>
                <input
                  type="date"
                  name="lastDiroDate"
                  value={formData.lastDiroDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로필 사진
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
                      <span className="ml-2 text-gray-600">
                        이미지 업로드 중...
                      </span>
                    </div>
                  ) : previewUrl ? (
                    <div className="relative w-full max-w-md">
                      <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="반려동물 사진"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {presignedImageUrl && (
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          카드 크기 (384×192)
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = handleImageChange as any;
                          input.click();
                        }}
                        className="absolute bottom-2 right-2 p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500">
                          <span>사진 업로드</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF 최대 10MB
                      </p>
                      <p className="text-xs text-gray-400">
                        🎯 카드 이미지 크기 (384×192px, 2:1 비율)로 크롭됩니다
                      </p>
                      <p className="text-xs text-gray-400">
                        🔍 확대/축소로 원하는 부분을 선택하세요
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  특이사항
                </label>
                <textarea
                  name="specialNote"
                  value={formData.specialNote}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                  placeholder="반려동물의 특이사항을 입력하세요 (알러지, 질병 등)"
                />
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "처리 중..." : petData ? "수정하기" : "등록하기"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              취소
            </button>
          </div>
        </form>
      </div>

      {/* 이미지 크롭 모달 - 카드 출력 크기로 고정 크롭 */}
      {showCropper && selectedImageForCrop && (
        <ImageCropper
          imageSrc={selectedImageForCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
};

export default PetRegist;
