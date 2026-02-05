"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HospitalCombobox from "@/components/HospitalCombobox";
import { debounce } from "lodash";
import { toast } from "react-hot-toast";

export default function UserRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    emergencyContact: "",
  });
  // provider 상태 추가
  const [provider, setProvider] = useState<"KAKAO" | "NAVER" | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<{
    id: number | null;
    name: string;
  }>({ id: null, name: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [nameValid, setNameValid] = useState(false);

  // 소셜 로그인 유저 정보 로딩 상태
  const [socialUserLoading, setSocialUserLoading] = useState(true);
  const [socialUserError, setSocialUserError] = useState<string | null>(null);

  // 이메일 유효성 상태
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);

  // 전화번호 유효성 상태
  const [phoneValid, setPhoneValid] = useState(false);
  const [emergencyPhoneValid, setEmergencyPhoneValid] = useState(false);

  const [hospitalValid, setHospitalValid] = useState(false);

  // 소셜 로그인 유저 정보 가져오기
  useEffect(() => {
    const fetchSocialUserInfo = async () => {
      try {
        setSocialUserLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social/me`,
          {
            method: "GET",
            credentials: "include", // HttpOnly 쿠키 포함
          }
        );

        if (response.ok) {
          const userData = await response.json(); // 이메일을 폼에 미리 채워넣기
          console.log("Social user data:", userData); // 추가
          console.log("Provider value:", userData.provider); // 추가

          if (userData.email) {
            setFormData((prev) => ({ ...prev, email: userData.email }));
            setEmailValid(true); // 소셜 로그인 이메일은 이미 검증된 것으로 간주
            setEmailError(null);
            // provider 정보 저장
            setProvider((userData.provider as "KAKAO" | "NAVER") || null);
          }
        } else {
          setSocialUserError("소셜 로그인 정보를 가져올 수 없습니다.");
        }
      } catch (error) {
        console.error("소셜 유저 정보 조회 오류:", error);
        setSocialUserError(
          "소셜 로그인 정보를 가져오는 중 오류가 발생했습니다."
        );
      } finally {
        setSocialUserLoading(false);
      }
    };

    fetchSocialUserInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // 이름
    if (name === "name") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setNameValid(!!value.trim()); // 값이 있으면 유효
    }

    // 전화번호 체크
    if (name === "phoneNumber") {
      const formattedPhoneNumber = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formattedPhoneNumber }));

      setPhoneValid(validatePhoneNumber(formattedPhoneNumber));
    }

    // 비상 전화번호 체크
    if (name === "emergencyContact") {
      const formattedPhoneNumber = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formattedPhoneNumber }));

      // 유효성 검사 (값이 있을 때만)
      if (formattedPhoneNumber) {
        setEmergencyPhoneValid(validatePhoneNumber(formattedPhoneNumber));
      } else {
        setEmergencyPhoneValid(true);
      }
    }
  };

  const handleHospitalChange = (id: number | null, name: string) => {
    setSelectedHospital({ id, name });
    setHospitalValid(!!id);
  };

  const validatePhoneNumber = (phone: string) => {
    const regex = /^010-\d{4}-\d{4}$/;
    return regex.test(phone);
  };

  const validateForm = () => {
    if (!formData.name) {
      setError("이름을 입력해주세요.");
      return false;
    }

    if (!formData.phoneNumber || !phoneValid) {
      setError("올바른 전화번호를 입력해주세요.");
      return false;
    }

    if (formData.emergencyContact && !emergencyPhoneValid) {
      setError("올바른 비상 연락처를 입력해주세요.");
      return false;
    }

    if (!selectedHospital.id) {
      setError("소속 병원을 선택해주세요.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const updateData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        emergencyContact: formData.emergencyContact,
        role: "ROLE_USER",
        vetInfo: {
          id: selectedHospital.id,
        },
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
          credentials: "include", // HttpOnly 쿠키 포함
        }
      );

      if (!response.ok) {
        // Try to parse error message from response
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "회원가입 정보 업데이트에 실패했습니다."
          );
        } catch (e) {
          // If we can't parse the error message, use the status text
          throw new Error(
            `회원가입 정보 업데이트에 실패했습니다. (${response.status}: ${response.statusText})`
          );
        }
      }

      const data = await response.json();
      // 회원가입 성공
      toast.success("회원가입에 성공했습니다.");
      router.push("/"); // 대시보드로 이동
    } catch (error) {
      console.error("회원가입 정보 업데이트 오류:", error);
      toast.error("회원가입 정보 업데이트에 실패했습니다.");
      setError(
        error instanceof Error
          ? error.message
          : "회원가입 정보 업데이트에 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "");

    // 최대 11자리까지만 제한
    const limitedNumbers = numbers.substring(0, 11);

    if (limitedNumbers.length <= 3) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(
        3,
        7
      )}-${limitedNumbers.slice(7, 11)}`;
    }
  };

  // 소셜 유저 정보 로딩 중일 때
  if (socialUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49BEB7] mx-auto"></div>
          <p className="mt-4 text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 소셜 유저 정보 로딩 실패 시
  if (socialUserError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {socialUserError}
          </div>
          <Link
            href="/login"
            className="mt-4 inline-block text-[#49BEB7] hover:text-[#3ea9a2] font-medium"
          >
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#49BEB7] mb-2">ANIDOC</h1>
          <h2 className="text-gray-600 text-sm">동물병원 관리 시스템</h2>
          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            추가 정보 입력
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            회원가입을 완료하기 위해 추가 정보를 입력해주세요.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 이름 */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                이름 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    nameValid
                      ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none`}
                />

                {nameValid && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* 이메일 (읽기 전용) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  readOnly
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm text-gray-600 cursor-not-allowed"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                소셜 계정의 이메일이 자동으로 설정되었습니다.
              </p>
            </div>

            {/* 연락처 */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                연락처 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    phoneValid
                      ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none`}
                />

                {phoneValid && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* 비상 연락처 */}
            <div>
              <label
                htmlFor="emergencyContact"
                className="block text-sm font-medium text-gray-700"
              >
                비상 연락처
              </label>
              <div className="mt-1 relative">
                <input
                  id="emergencyContact"
                  name="emergencyContact"
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    formData.emergencyContact && emergencyPhoneValid
                      ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                      : formData.emergencyContact && !emergencyPhoneValid
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none`}
                />

                {formData.emergencyContact && emergencyPhoneValid && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* 병원 선택 */}
            <div>
              <label
                htmlFor="hospital"
                className="block text-sm font-medium text-gray-700"
              >
                병원명 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <HospitalCombobox
                  onChange={(id, name) => handleHospitalChange(id, name)}
                  name="hospital"
                  placeholder="소속 병원을 선택해주세요"
                  required
                />
                {hospitalValid && (
                  <div className="absolute inset-y-0 right-8 flex items-center z-10">
                    <svg
                      className="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#49BEB7] hover:bg-[#3ea9a2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#49BEB7] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "처리 중..." : "회원가입 완료"}
            </button>

            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
