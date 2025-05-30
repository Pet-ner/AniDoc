"use client";

import { useState, useEffect } from "react";
import ProfileSidebar from "@/components/ProfileSidebar";
import { useUser } from "@/contexts/UserContext";

type ProfileData = {
  email: string;
  password: string;
  phoneNumber: string;
  emergencyContact: string;
  vetInfoId: number;
  socialLogin?: boolean; // isSocialLogin → socialLogin으로 변경
};

export default function ProfilePage() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [vetInfo, setVetInfo] = useState<{ vetName: string } | null>(null);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVetInfoLoading, setIsVetInfoLoading] = useState(false);

  // 전화번호 유효성 상태
  const [phoneValid, setPhoneValid] = useState(false);
  const [emergencyPhoneValid, setEmergencyPhoneValid] = useState(false);

  // 초기값을 빈 문자열로 설정
  const [formData, setFormData] = useState({
    currentPassword: "",
    password: "",
    phoneNumber: "",
    emergencyContact: "",
  });

  // socialLogin 필드를 사용하도록 수정
  const isSocialLogin = Boolean(profileData?.socialLogin === true);

  // 디버깅을 위해 console.log 추가 (실제 배포 시에는 제거)
  console.log("Profile data for social login check:", {
    profileData,
    socialLogin: profileData?.socialLogin,
    result: isSocialLogin,
  });

  // 프로필 전용 유저 정보 조회 함수
  const fetchProfileInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me/profile`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched profile data:", data);
        setProfileData(data);

        // 프로필 데이터가 로드된 후 formData 업데이트
        setFormData({
          currentPassword: "",
          password: "",
          phoneNumber: data.phoneNumber || "",
          emergencyContact: data.emergencyContact || "",
        });

        // 전화번호 유효성 검사
        setPhoneValid(
          data.phoneNumber ? validatePhoneNumber(data.phoneNumber) : false
        );
        setEmergencyPhoneValid(
          data.emergencyContact
            ? validatePhoneNumber(data.emergencyContact)
            : true
        );

        return data;
      } else {
        console.error("Failed to fetch profile info:", response.status);
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching profile info:", error);
      // 사용자에게 에러 메시지 표시 가능
    } finally {
      setIsLoading(false);
    }
  };

  // 병원 정보 조회
  const fetchVetInfo = async (vetInfoId: number) => {
    try {
      setIsVetInfoLoading(true);
      console.log("Fetching vet info with ID:", vetInfoId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vets/${vetInfoId}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched vet info:", data);
        setVetInfo(data);
      } else {
        console.error("Failed to fetch vet info:", response.status);
        setVetInfo(null);
      }
    } catch (error) {
      console.error("Error fetching vet info:", error);
      setVetInfo(null);
    } finally {
      setIsVetInfoLoading(false);
    }
  };

  // 병원 정보 조회 useEffect
  useEffect(() => {
    const vetInfoId = profileData?.vetInfoId || user?.vetInfoId;

    if (vetInfoId) {
      fetchVetInfo(vetInfoId);
    } else {
      console.log("No vetInfoId found");
      setVetInfo(null);
      setIsVetInfoLoading(false);
    }
  }, [profileData?.vetInfoId, user?.vetInfoId]);

  // 비밀번호 유효성 상태
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    cases: false,
    numbers: false,
  });
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [currentPasswordError, setCurrentPasswordError] = useState<
    string | null
  >(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 현재 비밀번호 확인 API 호출
  const verifyCurrentPassword = async () => {
    if (!formData.currentPassword.trim()) {
      setCurrentPasswordError("현재 비밀번호를 입력해주세요.");
      return;
    }

    setCurrentPasswordError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/verify-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ password: formData.currentPassword }),
        }
      );

      if (response.ok) {
        setIsVerifyingPassword(false);
        setIsChangingPassword(true);
      } else {
        const errorData = await response.json();
        setCurrentPasswordError(
          errorData.message || "현재 비밀번호가 일치하지 않습니다."
        );
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      setCurrentPasswordError("비밀번호 확인 중 오류가 발생했습니다.");
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

    const score = Object.values(checks).filter(Boolean).length;
    setPasswordScore(score);

    if (password) {
      if (score < 3) {
        setPasswordError("안전한 비밀번호를 위해 모든 조건을 충족해주세요.");
      } else {
        setPasswordError(null);
      }
    } else {
      setPasswordError(null);
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
    if (passwordScore === 1) return "w-[33%]";
    if (passwordScore === 2) return "w-[66%]";
    return "w-[100%]";
  };

  const handleSave = async () => {
    setSaveError(null);

    // 전화번호 유효성 검사
    if (!phoneValid) {
      setSaveError("올바른 전화번호 형식을 입력해주세요.");
      return;
    }

    // 비상연락처가 있는 경우 유효성 검사
    if (formData.emergencyContact && !emergencyPhoneValid) {
      setSaveError("올바른 비상연락처 형식을 입력해주세요.");
      return;
    }

    // 일반 로그인이고 비밀번호 변경 시에만 유효성 검사
    if (
      !isSocialLogin &&
      isChangingPassword &&
      formData.password &&
      passwordScore < 3
    ) {
      setSaveError("비밀번호가 보안 요구사항을 충족하지 않습니다.");
      setPasswordError("안전한 비밀번호를 위해 모든 조건을 충족해주세요.");
      return;
    }

    try {
      const requestBody = {
        password: "",
        phoneNumber: formData.phoneNumber,
        emergencyContact: formData.emergencyContact,
      };

      // 일반 로그인이고 비밀번호 변경이 활성화되고 실제로 입력된 경우에만 포함
      if (!isSocialLogin && isChangingPassword && formData.password) {
        requestBody.password = formData.password;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        await fetchProfileInfo();
        setIsEditing(false);
        setIsVerifyingPassword(false);
        setIsChangingPassword(false);

        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          password: "",
        }));

        resetPasswordState();
      } else {
        const errorData = await response.json();
        setSaveError(errorData.message || "프로필 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveError("프로필 업데이트 중 오류가 발생했습니다.");
    }
  };

  const resetPasswordState = () => {
    setPasswordScore(0);
    setPasswordChecks({
      length: false,
      cases: false,
      numbers: false,
    });
    setPasswordError(null);
    setCurrentPasswordError(null);
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: "",
      password: "",
      phoneNumber: profileData?.phoneNumber || "",
      emergencyContact: profileData?.emergencyContact || "",
    });
    setIsEditing(false);
    setIsVerifyingPassword(false);
    setIsChangingPassword(false);
    resetPasswordState();
    setSaveError(null);
  };

  // 비밀번호 변경 취소
  const handlePasswordChangeCancel = () => {
    setIsVerifyingPassword(false);
    setIsChangingPassword(false);
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      password: "",
    }));
    resetPasswordState();
  };

  // 전화번호 포맷팅 함수
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

  // 전화번호 유효성 검증 함수
  const validatePhoneNumber = (phone: string) => {
    const regex = /^010-\d{4}-\d{4}$/;
    return regex.test(phone);
  };

  // 컴포넌트 마운트 시 프로필 정보 조회
  useEffect(() => {
    fetchProfileInfo();
  }, []);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <ProfileSidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#49BEB7] mx-auto"></div>
              <p className="mt-2 text-gray-500">프로필 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ProfileSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">개인 정보 관리</h1>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={profileData?.email || ""}
                className="w-full p-2 border rounded-md bg-gray-50 text-gray-500"
                readOnly
              />
              <p className="mt-1 text-sm text-gray-500">
                이메일은 변경할 수 없습니다.
              </p>
            </div>

            {/* Password - 소셜 로그인 여부에 따라 다르게 렌더링 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                {/* 일반 로그인이고 수정 모드일 때만 비밀번호 변경 버튼 표시 */}
                {!isSocialLogin &&
                  isEditing &&
                  !isVerifyingPassword &&
                  !isChangingPassword && (
                    <button
                      onClick={() => setIsVerifyingPassword(true)}
                      className="text-sm text-[#49BEB7] hover:text-[#3ea9a2] font-medium"
                    >
                      비밀번호 변경
                    </button>
                  )}
                {!isSocialLogin &&
                  isEditing &&
                  (isVerifyingPassword || isChangingPassword) && (
                    <button
                      onClick={handlePasswordChangeCancel}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                    >
                      취소
                    </button>
                  )}
              </div>

              {!isSocialLogin ? (
                // 일반 로그인: 비밀번호 변경 가능

                !isVerifyingPassword && !isChangingPassword ? (
                  <div>
                    <input
                      type="password"
                      value="********"
                      className="w-full p-2 border rounded-md bg-gray-50 text-gray-500"
                      readOnly
                    />
                    {!isEditing && (
                      <p className="mt-1 text-sm text-gray-500">
                        비밀번호를 변경하려면 수정 버튼을 눌러주세요.
                      </p>
                    )}
                  </div>
                ) : isVerifyingPassword ? (
                  // 현재 비밀번호 확인 단계
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="현재 비밀번호를 입력하세요"
                      value={formData.currentPassword}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          currentPassword: e.target.value,
                        });
                        setCurrentPasswordError(null);
                      }}
                      className={`w-full p-2 border rounded-md ${
                        currentPasswordError
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
                      }`}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && formData.currentPassword) {
                          verifyCurrentPassword();
                        }
                      }}
                    />
                    {currentPasswordError && (
                      <p className="text-sm text-red-600">
                        {currentPasswordError}
                      </p>
                    )}
                    <button
                      onClick={verifyCurrentPassword}
                      disabled={!formData.currentPassword.trim()}
                      className="px-4 py-2 bg-[#49BEB7] hover:bg-[#3ea9a2] disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
                    >
                      확인
                    </button>
                  </div>
                ) : (
                  // 새 비밀번호 입력 단계
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="새 비밀번호 입력"
                      value={formData.password}
                      onChange={(e) => {
                        const newPassword = e.target.value;
                        setFormData({ ...formData, password: newPassword });
                        checkPasswordStrength(newPassword);
                      }}
                      className={`w-full p-2 border rounded-md ${
                        passwordScore === 3
                          ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                          : passwordError
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
                      }`}
                    />

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
                            passwordChecks.length
                              ? "text-green-600"
                              : "text-gray-500"
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
                              />
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
                              />
                            </svg>
                          )}
                          <span>8자 이상</span>
                        </li>
                        <li
                          className={`flex items-center ${
                            passwordChecks.cases
                              ? "text-green-600"
                              : "text-gray-500"
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
                              />
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
                              />
                            </svg>
                          )}
                          <span>영문 대소문자 포함</span>
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
                              />
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
                              />
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
                )
              ) : (
                // 소셜 로그인: 비밀번호 필드 비활성화
                <div>
                  <input
                    type="password"
                    value="소셜 로그인 계정"
                    className="w-full p-2 border rounded-md bg-gray-50 text-gray-500"
                    readOnly
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.
                  </p>
                </div>
              )}
            </div>

            {/* Hospital */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                소속
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={
                    isVetInfoLoading ? "로딩 중..." : vetInfo?.vetName || ""
                  }
                  className="w-full p-2 border rounded-md bg-gray-50 text-gray-500"
                  readOnly
                />
                {isVetInfoLoading && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#49BEB7]"></div>
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                소속은 변경할 수 없습니다.
              </p>
            </div>

            {/* Contact Info Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연락처
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const formattedPhoneNumber = formatPhoneNumber(
                      e.target.value
                    );
                    setFormData((prev) => ({
                      ...prev,
                      phoneNumber: formattedPhoneNumber,
                    }));
                    setPhoneValid(validatePhoneNumber(formattedPhoneNumber));
                  }}
                  placeholder="010-0000-0000"
                  className={`w-full p-2 border rounded-md ${
                    isEditing
                      ? phoneValid && formData.phoneNumber
                        ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                        : formData.phoneNumber && !phoneValid
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
                      : "bg-gray-50"
                  }`}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비상연락처
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => {
                    const formattedPhoneNumber = formatPhoneNumber(
                      e.target.value
                    );
                    setFormData((prev) => ({
                      ...prev,
                      emergencyContact: formattedPhoneNumber,
                    }));
                    // 값이 있을 때만 유효성 검사
                    if (formattedPhoneNumber) {
                      setEmergencyPhoneValid(
                        validatePhoneNumber(formattedPhoneNumber)
                      );
                    } else {
                      setEmergencyPhoneValid(true); // 빈 값은 허용
                    }
                  }}
                  placeholder="010-0000-0000"
                  className={`w-full p-2 border rounded-md ${
                    isEditing
                      ? formData.emergencyContact
                        ? emergencyPhoneValid
                          ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                          : "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
                      : "bg-gray-50"
                  }`}
                  readOnly={!isEditing}
                />
              </div>
            </div>

            {/* Error Message */}
            {saveError && (
              <div className="text-red-600 text-sm">{saveError}</div>
            )}

            {/* Buttons */}
            <div className="pt-6 border-t border-gray-200 flex justify-end">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-[#49BEB7] hover:bg-[#3ea9a2] text-white rounded-md transition-colors min-w-[100px]"
                >
                  수정
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-[#49BEB7] hover:bg-[#3ea9a2] text-white rounded-md transition-colors min-w-[100px]"
                  >
                    저장
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md transition-colors min-w-[100px]"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
