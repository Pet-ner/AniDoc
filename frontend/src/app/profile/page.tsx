"use client";

import { useState, useEffect } from "react";
import ProfileSidebar from "@/components/ProfileSidebar";
import { useUser } from "@/contexts/UserContext";
import PasswordSection from "@/components/profile/PasswordSection";
import ContactInfo from "@/components/profile/ContactInfo";
import HospitalSection from "@/components/profile/HospitalSection";

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

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
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

  // API 호출 함수들
  const fetchProfileInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me/profile`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setProfileData(data);

      // 프로필 데이터로 폼 상태 업데이트
      updateFormDataFromProfile(data);

      return data;
    } catch (error) {
      console.error("Error fetching profile info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 프로필 데이터로 폼 상태 업데이트
  const updateFormDataFromProfile = (data: any) => {
    setFormData({
      currentPassword: "",
      password: "",
      phoneNumber: data.phoneNumber || "",
      emergencyContact: data.emergencyContact || "",
    });

    setPhoneValid(
      data.phoneNumber ? validatePhoneNumber(data.phoneNumber) : false
    );
    setEmergencyPhoneValid(
      data.emergencyContact ? validatePhoneNumber(data.emergencyContact) : true
    );
  };

  // 병원 정보 조회
  const fetchVetInfo = async (vetInfoId: number) => {
    try {
      setIsVetInfoLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vets/${vetInfoId}`,
        {
          credentials: "include",
        }
      );

      const data = response.ok ? await response.json() : null;
      setVetInfo(data);
    } catch (error) {
      console.error("Error fetching vet info:", error);
      setVetInfo(null);
    } finally {
      setIsVetInfoLoading(false);
    }
  };

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
        return;
      }

      const errorData = await response.json();
      setCurrentPasswordError(
        errorData.message || "현재 비밀번호가 일치하지 않습니다."
      );
    } catch (error) {
      console.error("Error verifying password:", error);
      setCurrentPasswordError("비밀번호 확인 중 오류가 발생했습니다.");
    }
  };

  const validateProfileData = () => {
    if (!phoneValid) {
      setSaveError("올바른 전화번호 형식을 입력해주세요.");
      return false;
    }

    if (formData.emergencyContact && !emergencyPhoneValid) {
      setSaveError("올바른 비상연락처 형식을 입력해주세요.");
      return false;
    }

    if (
      !isSocialLogin &&
      isChangingPassword &&
      formData.password &&
      passwordScore < 3
    ) {
      setSaveError("비밀번호가 보안 요구사항을 충족하지 않습니다.");
      setPasswordError("안전한 비밀번호를 위해 모든 조건을 충족해주세요.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setSaveError(null);

    if (!validateProfileData()) {
      return;
    }

    const requestBody = {
      password:
        !isSocialLogin && isChangingPassword && formData.password
          ? formData.password
          : "",
      phoneNumber: formData.phoneNumber,
      emergencyContact: formData.emergencyContact,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setSaveError(errorData.message || "프로필 업데이트에 실패했습니다.");
        return;
      }

      await fetchProfileInfo();

      // 상태 초기화
      setIsEditing(false);
      setIsVerifyingPassword(false);
      setIsChangingPassword(false);
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        password: "",
      }));
      resetPasswordState();
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

  // 이벤트 핸들러
  const handlePhoneNumberChange = (value: string) => {
    const formattedPhoneNumber = formatPhoneNumber(value);
    setFormData((prev) => ({
      ...prev,
      phoneNumber: formattedPhoneNumber,
    }));
    setPhoneValid(validatePhoneNumber(formattedPhoneNumber));
  };

  const handleEmergencyContactChange = (value: string) => {
    const formattedPhoneNumber = formatPhoneNumber(value);
    setFormData((prev) => ({
      ...prev,
      emergencyContact: formattedPhoneNumber,
    }));
    if (formattedPhoneNumber) {
      setEmergencyPhoneValid(validatePhoneNumber(formattedPhoneNumber));
    } else {
      setEmergencyPhoneValid(true);
    }
  };

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

  useEffect(() => {
    fetchProfileInfo();
  }, []);

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

      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">개인 정보 관리</h1>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
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

            <PasswordSection
              isSocialLogin={isSocialLogin}
              isEditing={isEditing}
              currentPassword={formData.currentPassword}
              password={formData.password}
              isVerifyingPassword={isVerifyingPassword}
              isChangingPassword={isChangingPassword}
              passwordScore={passwordScore}
              passwordChecks={passwordChecks}
              passwordError={passwordError}
              currentPasswordError={currentPasswordError}
              onPasswordChange={(value) => {
                setFormData({ ...formData, password: value });
                checkPasswordStrength(value);
              }}
              onCurrentPasswordChange={(value) => {
                setFormData({ ...formData, currentPassword: value });
                setCurrentPasswordError(null);
              }}
              onVerifyPassword={verifyCurrentPassword}
              onChangePasswordClick={() => setIsVerifyingPassword(true)}
              onPasswordChangeCancel={handlePasswordChangeCancel}
            />

            <HospitalSection
              vetName={vetInfo?.vetName}
              isLoading={isVetInfoLoading}
            />

            <ContactInfo
              phoneNumber={formData.phoneNumber}
              emergencyContact={formData.emergencyContact}
              isEditing={isEditing}
              phoneValid={phoneValid}
              emergencyPhoneValid={emergencyPhoneValid}
              onPhoneNumberChange={handlePhoneNumberChange}
              onEmergencyContactChange={handleEmergencyContactChange}
            />

            {saveError && (
              <div className="text-red-600 text-sm">{saveError}</div>
            )}

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
