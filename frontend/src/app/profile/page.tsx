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
};

export default function ProfilePage() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [vetInfo, setVetInfo] = useState<{ vetName: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false); // 비밀번호 변경 모드
  const [profileData, setProfileData] = useState<ProfileData | null>(null); // 프로필 데이터 저장용 추가
  const [formData, setFormData] = useState({
    password: user?.password || "",
    phoneNumber: user?.phoneNumber || "",
    emergencyContact: user?.emergencyContact || "",
  });

  // 프로필 전용 유저 정보 조회 함수
  const fetchProfileInfo = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me/profile`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched profile data:", data); // 디버깅용

        // 프로필 데이터 저장
        setProfileData(data);

        // 폼 데이터 업데이트
        setFormData({
          password: "",
          phoneNumber: data.phoneNumber || "",
          emergencyContact: data.emergencyContact || "",
        });
        return data;
      }
    } catch (error) {
      console.error("Error fetching profile info:", error);
    }
  };

  // 병원 정보 조회 - profileData.vetInfoId 사용
  useEffect(() => {
    const fetchVetInfo = async () => {
      const vetInfoId = profileData?.vetInfoId || user?.vetInfoId; // 두 소스 모두 확인

      if (vetInfoId) {
        try {
          console.log("Fetching vet info with ID:", vetInfoId); // 디버깅용
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
          }
        } catch (error) {
          console.error("Error fetching vet info:", error);
        }
      } else {
        console.log("No vetInfoId found"); // 디버깅용
        setVetInfo(null);
      }
    };
    fetchVetInfo();
  }, [profileData?.vetInfoId, user?.vetInfoId]); // profileData도 의존성에 추가

  // 비밀번호 유효성 상태
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    cases: false,
    numbers: false,
  });
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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
    if (passwordScore === 1) return "w-1/3";
    if (passwordScore === 2) return "w-2/3";
    return "w-full";
  };

  const handleSave = async () => {
    setSaveError(null);

    // 비밀번호 변경 시에만 유효성 검사
    if (isChangingPassword && formData.password && passwordScore < 3) {
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

      // 비밀번호 변경이 활성화되고 실제로 입력된 경우에만 포함
      if (isChangingPassword && formData.password) {
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
        setIsChangingPassword(false); // 비밀번호 변경 모드 해제

        // 저장 성공 시 비밀번호 관련 상태 초기화
        setFormData((prev) => ({
          ...prev,
          password: "",
        }));
        setPasswordScore(0);
        setPasswordChecks({
          length: false,
          cases: false,
          numbers: false,
        });
        setPasswordError(null);
      } else {
        const errorData = await response.json();
        setSaveError(errorData.message || "프로필 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveError("프로필 업데이트 중 오류가 발생했습니다.");
    }
  };

  const handleCancel = () => {
    setFormData({
      password: "",
      phoneNumber: profileData?.phoneNumber || user?.phoneNumber || "",
      emergencyContact:
        profileData?.emergencyContact || user?.emergencyContact || "",
    });
    setIsEditing(false);
    setIsChangingPassword(false); // 비밀번호 변경 모드 해제
    setPasswordError(null);
    setSaveError(null);
  };

  // 컴포넌트 마운트 시 프로필 정보 조회
  useEffect(() => {
    fetchProfileInfo();
  }, []);

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
                value={profileData?.email || user?.email || ""}
                className="w-full p-2 border rounded-md bg-gray-50 text-gray-500"
                readOnly
              />
              <p className="mt-1 text-sm text-gray-500">
                이메일은 변경할 수 없습니다.
              </p>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                {isEditing && !isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="text-sm text-[#49BEB7] hover:text-[#3ea9a2] font-medium"
                  >
                    비밀번호 변경
                  </button>
                )}
                {isEditing && isChangingPassword && (
                  <button
                    onClick={() => {
                      setIsChangingPassword(false);
                      setFormData((prev) => ({ ...prev, password: "" }));
                      setPasswordError(null);
                      setPasswordScore(0);
                      setPasswordChecks({
                        length: false,
                        cases: false,
                        numbers: false,
                      });
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                  >
                    취소
                  </button>
                )}
              </div>

              {!isChangingPassword ? (
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
              ) : (
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
              )}
            </div>

            {/* Hospital */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                소속
              </label>
              <input
                type="text"
                value={vetInfo?.vetName || ""}
                className="w-full p-2 border rounded-md bg-gray-50 text-gray-500"
                readOnly
              />
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
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  className={`w-full p-2 border rounded-md ${
                    isEditing ? "bg-white" : "bg-gray-50"
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: e.target.value,
                    })
                  }
                  className={`w-full p-2 border rounded-md ${
                    isEditing ? "bg-white" : "bg-gray-50"
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
