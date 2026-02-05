"use client";

import { useState, useRef } from "react";
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
  const [nameValid, setNameValid] = useState(false);

  // 이메일 유효성 상태
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);

  // 비밀번호 유효성 상태
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    cases: false,
    numbers: false,
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  // 전화번호 유효성 상태
  const [phoneValid, setPhoneValid] = useState(false);
  const [emergencyPhoneValid, setEmergencyPhoneValid] = useState(false);

  const [hospitalValid, setHospitalValid] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // 이름
    if (name === "name") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setNameValid(!!value.trim()); // 값이 있으면 유효
    }

    // 비밀번호 강도 체크
    if (name === "password") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      checkPasswordStrength(value);

      // 비밀번호 확인 체크
      if (formData.passwordConfirm) {
        if (value !== formData.passwordConfirm) {
          setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
        } else {
          setConfirmPasswordError(null);
        }
      }
    }

    // 비밀번호 확인 체크
    if (name === "passwordConfirm") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (value && formData.password !== value) {
        setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
      } else {
        setConfirmPasswordError(null);
      }
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

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const regex = /^010-\d{4}-\d{4}$/;
    return regex.test(phone);
  };

  // 이메일 중복 검사
  const checkEmailDuplicate = async (email: string) => {
    if (!email.trim()) {
      setEmailValid(false);
      setEmailError("이메일을 입력해주세요.");
      return;
    }

    if (!validateEmail(email)) {
      setEmailValid(false);
      setEmailError("유효한 이메일 형식이 아닙니다.");
      return;
    }

    setEmailChecking(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/users/emailCheck?email=${encodeURIComponent(email)}`
      );

      if (response.ok) {
        setEmailValid(true);
        setEmailError(null);
      } else {
        setEmailValid(false);
        setEmailError("이미 사용 중인 이메일입니다.");
      }
    } catch (error) {
      console.error("이메일 중복 체크 중 오류 발생:", error);
      setEmailValid(false);
      setEmailError("서버 오류가 발생했습니다.");
    } finally {
      setEmailChecking(false);
    }
  };

  // 비밀번호 강도 체크
  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      cases: /(?=.*[a-z])(?=.*[A-Z])/.test(password),
      numbers: /\d/.test(password),
    };

    setPasswordChecks(checks);

    // 강도 점수 계산
    const score = Object.values(checks).filter(Boolean).length;
    setPasswordScore(score);

    // 비밀번호 에러 메시지 업데이트
    if (password) {
      if (score < 3) {
        setPasswordError("안전한 비밀번호를 위해 모든 조건을 충족해주세요.");
      } else {
        setPasswordError(null);
      }
    } else {
      setPasswordError(null);
    }

    // 비밀번호 확인 체크
    if (formData.passwordConfirm) {
      if (password !== formData.passwordConfirm) {
        setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
      } else {
        setConfirmPasswordError(null);
      }
    }
  };

  // 디바운스 처리 - 유저가 입력을 잠시 멈췄을 때 중복체크 API 호출
  const debouncedEmailCheck = useRef(
    debounce((email: string) => checkEmailDuplicate(email), 500)
  ).current;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, email: value }));

    if (!value.trim()) {
      setEmailValid(null);
      setEmailError(null);
      return;
    }

    if (!validateEmail(value)) {
      setEmailValid(false);
      setEmailError("유효한 이메일 형식이 아닙니다.");
      return;
    }

    // 디바운스 처리된 이메일 중복체크
    debouncedEmailCheck(value);
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

    if (passwordScore < 3) {
      setError("비밀번호는 모든 보안 요구사항을 충족해야 합니다.");
      return false;
    }

    if (!selectedHospital.id) {
      setError("소속 병원을 선택해주세요.");
      return false;
    }

    if (emailValid !== true) {
      setError("이메일을 확인해주세요.");
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
      toast.success("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
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

  const getPasswordStrengthColor = () => {
    if (passwordScore === 0) return "bg-gray-200";
    if (passwordScore === 1) return "bg-red-500";
    if (passwordScore === 2) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthWidth = () => {
    if (passwordScore === 0) return "w-0";
    if (passwordScore === 1) return "w-1/3";
    if (passwordScore === 2) return "w-2/3";
    return "w-full";
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

            {/* 이메일 */}
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
                  onChange={handleEmailChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    emailValid === false
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : emailValid === true
                      ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none`}
                  placeholder="example@email.com"
                />

                {emailChecking && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}

                {emailValid === true && !emailChecking && (
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

                {emailValid === false && !emailChecking && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg
                      className="h-5 w-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}

              {emailValid === true && (
                <p className="mt-1 text-sm text-green-600">
                  사용 가능한 이메일입니다!
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
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    passwordScore === 3
                      ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                      : passwordError
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none`}
                />
                {passwordScore === 3 && (
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

              {/* 비밀번호 강도 인디케이터 */}
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${getPasswordStrengthColor()} transition-all duration-300 ${getPasswordStrengthWidth()}`}
                    ></div>
                  </div>
                </div>

                <ul className="space-y-1 text-xs">
                  <li
                    className={`flex items-center ${
                      passwordChecks.length ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {passwordChecks.length ? (
                      <svg
                        className="w-4 h-4 mr-1.5 text-green-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    )}
                    <span>최소 8자리 이상</span>
                  </li>
                  <li
                    className={`flex items-center ${
                      passwordChecks.cases ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {passwordChecks.cases ? (
                      <svg
                        className="w-4 h-4 mr-1.5 text-green-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    )}
                    <span>영어 대문자와 소문자 포함</span>
                  </li>
                  <li
                    className={`flex items-center ${
                      passwordChecks.numbers
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {passwordChecks.numbers ? (
                      <svg
                        className="w-4 h-4 mr-1.5 text-green-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    )}
                    <span>숫자 포함</span>
                  </li>
                </ul>

                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}

                {passwordScore === 3 && (
                  <p className="text-sm text-green-600">
                    안전한 비밀번호입니다!
                  </p>
                )}
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  required
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    confirmPasswordError
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : formData.passwordConfirm && !confirmPasswordError
                      ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none`}
                />

                {formData.passwordConfirm && !confirmPasswordError && (
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

              {confirmPasswordError && (
                <p className="mt-1 text-sm text-red-600">
                  {confirmPasswordError}
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
