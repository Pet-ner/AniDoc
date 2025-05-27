import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";

// Update Pet interface
interface Pet {
  id: number;
  name: string;
  birth: string;
  gender: string;
  species: string; // changed from type
  breed: string;
  weight: number;
  isNeutered: boolean;
  profileUrl?: string;
  lastDiroDate?: string;
  specialNote?: string;
}

interface PetProps {
  onClose: () => void;
}

// Pet 등록 데이터 타입 정의
interface PetRegistrationData {
  name: string;
  birth: string;
  gender: string;
  isNeutered: boolean;
  species: string; // changed from type
  breed: string;
  weight: number;
  lastDiroDate: string;
  profileUrl: string;
  specialNote: string;
}

// Add gender mapping constant
const GENDER_MAP = {
  수컷: "MALE",
  암컷: "FEMALE",
} as const;

interface PetRegistProps {
  petData?: Pet | null;
  onClose: () => void;
}

const PetRegist: React.FC<PetRegistProps> = ({ petData, onClose }) => {
  // userId 상태 제거
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // userId 관련 useEffect 제거

  // 폼 데이터 상태 추가
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

  // petData가 있을 경우 폼 데이터 초기화
  useEffect(() => {
    console.log("Pet data:", petData); // 디버깅 로그 추가
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
        setPreviewUrl(petData.profileUrl);
      }
    }
  }, [petData]);

  // 입력 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    console.log(
      "Checkbox change:",
      type,
      name,
      (e.target as HTMLInputElement).checked
    ); // 디버깅 로그 추가
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

    try {
      setLoading(true);

      const folder = "PROFILE_IMAGES";
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/s3/presigned-url?s3Folder=${folder}&fileName=${encodeURIComponent(
          file.name
        )}&contentType=${encodeURIComponent(file.type)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Presigned URL 발급 실패:", res.status, errorText);
        throw new Error("Presigned URL 발급 실패");
      }

      const { url: presignedUrl } = await res.json();
      if (!presignedUrl) {
        console.error("Presigned URL이 undefined입니다.");
        throw new Error("Presigned URL이 올바르지 않습니다.");
      }
      console.log("Presigned URL:", presignedUrl);

      // 3. S3에 이미지 업로드
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error(
          "S3 업로드 실패:",
          uploadRes.status,
          uploadRes.statusText,
          errorText
        );
        throw new Error("S3 업로드 실패");
      }

      // 4. 서버에 저장할 실제 URL (query string 제거)
      const objectKey = presignedUrl.split(".com/")[1]?.split("?")[0];
      const finalUrl = `https://anidoc-bucket.s3.ap-northeast-2.amazonaws.com/${objectKey}`;
      setImageUrl(finalUrl);

      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트가 언마운트될 때 미리보기 URL 해제
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 폼 제출 핸들러 수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Submit form data:", formData); // 디버깅 로그 추가

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
        isNeutered: Boolean(formData.isNeutered), // 명시적으로 boolean으로 변환
      };

      console.log("Request data:", petRequestData); // 디버깅 로그 추가

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

      const result = await response.json();
      console.log(`${petData ? "수정" : "등록"} 성공:`, result);
      alert(`반려동물이 성공적으로 ${petData ? "수정" : "등록"}되었습니다.`);
      onClose();
    } catch (error) {
      console.error(`${petData ? "수정" : "등록"} 실패:`, error);
      alert(
        error instanceof Error
          ? error.message
          : `반려동물 ${petData ? "수정" : "등록"} 중 오류가 발생했습니다.`
      );
    }
  };

  // 날짜 포맷 유틸리티 함수
  const formatDate = (date: string) => {
    if (!date) return null;
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
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
              생년월일
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
              성별
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
              종류
            </label>
            <select
              name="species"
              value={formData.species}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">동물의 종류를 선택하세요</option>
              <option value="강아지">강아지</option>
              <option value="고양이">고양이</option>
              <option value="고슴도치">고슴도치</option>
              <option value="햄스터">햄스터</option>
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
              체중 (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={(e) => {
                const value = Math.max(0, parseFloat(e.target.value) || 0);
                setFormData((prev) => ({
                  ...prev,
                  weight: value,
                }));
              }}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="체중을 입력하세요"
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
              사진 등록
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
                </div>
              ) : previewUrl ? (
                <div className="relative w-full aspect-video">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl("");
                      setImageUrl("");
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    ✕
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
                      d="M12 4v16m8-8H4"
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

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          {petData ? "수정하기" : "등록하기"}
        </button>
      </div>
    </form>
  );
};

export default PetRegist;
