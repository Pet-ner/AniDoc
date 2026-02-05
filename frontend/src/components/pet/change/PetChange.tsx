import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface PetChangeProps {
  petId: number;
  onClose: () => void;
}

interface PetData {
  name: string;
  birth: string; // changed from birthDate
  gender: string;
  isNeutered: boolean;
  species: string; // changed from type
  breed: string;
  weight: number;
  lastDiroDate: string; // changed from lastHeartWormDate
  profileUrl: string; // changed from imageUrl
  specialNote: string;
}

// 타입 정의 추가
type Gender = "MALE" | "FEMALE";

const GENDER_MAP = {
  수컷: "MALE",
  암컷: "FEMALE",
} as const;

const REVERSE_GENDER_MAP: Record<Gender, string> = {
  MALE: "수컷",
  FEMALE: "암컷",
};

const PetChange = ({ petId, onClose }: PetChangeProps) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [formData, setFormData] = useState<PetData>({
    name: "",
    birth: "", // changed
    gender: "",
    isNeutered: false,
    species: "", // changed
    breed: "",
    weight: 0,
    lastDiroDate: "", // changed
    profileUrl: "", // changed
    specialNote: "",
  });

  // 기존 데이터 불러오기
  useEffect(() => {
    const fetchPetData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pets/${petId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("반려동물 정보를 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        // Transform backend data to frontend format
        console.log("Fetched data:", JSON.stringify(data, null, 2));
        setFormData({
          ...data,
          birth: data.birth?.split("T")[0] || "", // changed
          gender: REVERSE_GENDER_MAP[data.gender as Gender] || "",
          species: data.species || "", // changed
          lastDiroDate: data.lastDiroDate // changed
            ? data.lastDiroDate.split("T")[0]
            : "",
          profileUrl: data.profileUrl || "", // changed
        });
        setImageUrl(data.profileUrl || "");
        setPreviewUrl(data.profileUrl || "");
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        toast.error("반려동물 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchPetData();
    }
  }, [petId]);

  // 입력 핸들러
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

  // 이미지 업로드 핸들러
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const folder = "PROFILE_IMAGES";

      // Presigned URL 요청
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/s3/presigned-url?s3Folder=${folder}&fileName=${encodeURIComponent(
          file.name
        )}&contentType=${encodeURIComponent(file.type)}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Presigned URL 발급 실패");
      }

      const { url: presignedUrl } = await res.json();

      // S3에 이미지 업로드
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("이미지 업로드 실패");
      }

      // 최종 URL 생성
      const objectKey = presignedUrl.split(".com/")[1]?.split("?")[0];
      const finalUrl = `https://anidoc-bucket.s3.ap-northeast-2.amazonaws.com/${objectKey}`;
      setImageUrl(finalUrl);
      setPreviewUrl(URL.createObjectURL(file));
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
      toast.error("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 수정 제출 핸들러
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

      const petData = {
        ...formData,
        birth: new Date(formData.birth).toISOString().split("T")[0], // changed
        species: formData.species, // changed
        gender: GENDER_MAP[formData.gender as keyof typeof GENDER_MAP],
        profileUrl: formData.profileUrl || null, // keep as imageUrl for API
        weight: parseFloat(formData.weight.toString()),
        lastDiroDate: formData.lastDiroDate // changed
          ? new Date(formData.lastDiroDate).toISOString().split("T")[0]
          : null,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pets/${petId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(petData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          typeof errorData === "string"
            ? errorData
            : "반려동물 정보 수정에 실패했습니다."
        );
      }

      toast.success("반려동물 정보가 성공적으로 수정되었습니다.");
      onClose();
    } catch (error) {
      console.error("수정 실패:", error);
      toast.error("수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 기존 폼 필드들을 여기에 추가 - page.tsx의 JSX와 동일 */}
      <div className="mt-4 flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "처리 중..." : "수정"}
        </button>
      </div>
    </form>
  );
};

export default PetChange;
