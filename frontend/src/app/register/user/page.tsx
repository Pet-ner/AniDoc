"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HospitalCombobox from "@/components/HospitalCombobox";

export default function UserRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phoneNumber: "",
    emergencyContact: "",
  });
  const [selectedHospital, setSelectedHospital] = useState<{
    id: number | null;
    name: string;
  }>({ id: null, name: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailCheckStatus, setEmailCheckStatus] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 이메일이 변경되면 이메일 체크 상태 초기화
    if (name === "email") {
      setEmailCheckStatus(null);
    }
  };

  const handleHospitalChange = (id: number | null, name: string) => {
    setSelectedHospital({ id, name });
  };

  // 이메일 중복 검사
  const checkEmailDuplicate = async () => {
    if (!formData.email) {
      setEmailCheckStatus("이메일을 입력해주세요.");
      return;
    }

    setEmailChecking(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/emailCheck?email=${formData.email}`
      );

      if (response.ok) {
        setEmailCheckStatus("사용 가능한 이메일입니다.");
      } else {
        setEmailCheckStatus("이미 사용 중인 이메일입니다.");
      }
    } catch (error) {
      setEmailCheckStatus("이메일 확인 중 오류가 발생했습니다.");
      console.error("이메일 중복 확인 오류:", error);
    } finally {
      setEmailChecking(false);
    }
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phoneNumber
    ) {
      setError("필수 항목을 모두 입력해주세요.");
      return false;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return false;
    }

    if (!selectedHospital.id) {
      setError("소속 병원을 선택해주세요.");
      return false;
    }

    if (emailCheckStatus !== "사용 가능한 이메일입니다.") {
      setError("이메일 중복 확인을 해주세요.");
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
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "ROLE_USER",
        phoneNumber: formData.phoneNumber,
        emergencyContact: formData.emergencyContact,
        vetInfoId: selectedHospital.id,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "회원가입에 실패했습니다.");
      }

      // 회원가입 성공
      alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
      router.push("/login");
    } catch (error) {
      console.error("회원가입 오류:", error);
      setError(
        error instanceof Error ? error.message : "회원가입에 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#49BEB7] mb-2">ANIDOC</h1>
          <h2 className="text-gray-600 text-sm">동물병원 관리 시스템</h2>
          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            보호자 회원가입
          </h3>
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
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#49BEB7] focus:border-[#49BEB7]"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:outline-none focus:ring-[#49BEB7] focus:border-[#49BEB7]"
                />
                <button
                  type="button"
                  onClick={checkEmailDuplicate}
                  disabled={emailChecking || !formData.email}
                  className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[#49BEB7]"
                >
                  {emailChecking ? "확인 중..." : "중복 확인"}
                </button>
              </div>
              {emailCheckStatus && (
                <p
                  className={`mt-1 text-sm ${
                    emailCheckStatus === "사용 가능한 이메일입니다."
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {emailCheckStatus}
                </p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#49BEB7] focus:border-[#49BEB7]"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                required
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#49BEB7] focus:border-[#49BEB7]"
              />
              {formData.password &&
                formData.passwordConfirm &&
                formData.password !== formData.passwordConfirm && (
                  <p className="mt-1 text-sm text-red-600">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
            </div>

            {/* 연락처 */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="01012345678"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#49BEB7] focus:border-[#49BEB7]"
              />
            </div>

            {/* 비상 연락처 */}
            <div>
              <label
                htmlFor="emergencyContact"
                className="block text-sm font-medium text-gray-700"
              >
                비상 연락처
              </label>
              <input
                id="emergencyContact"
                name="emergencyContact"
                type="tel"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="01012345678"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#49BEB7] focus:border-[#49BEB7]"
              />
            </div>

            {/* 병원 선택 */}
            <div>
              <label
                htmlFor="hospital"
                className="block text-sm font-medium text-gray-700"
              >
                병원명 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <HospitalCombobox
                  onChange={(id, name) => handleHospitalChange(id, name)}
                  name="hospital"
                  placeholder="소속 병원을 선택해주세요"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#49BEB7] hover:bg-[#3ea9a2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#49BEB7] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "처리 중..." : "회원가입"}
            </button>

            <Link
              href="/register"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              이전으로
            </Link>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-[#49BEB7] hover:text-[#3ea9a2]"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
