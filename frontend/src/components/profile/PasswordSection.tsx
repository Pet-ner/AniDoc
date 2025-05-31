import { useState } from "react";

interface PasswordSectionProps {
  isSocialLogin: boolean;
  isEditing: boolean;
  currentPassword: string;
  password: string;
  isVerifyingPassword: boolean;
  isChangingPassword: boolean;
  passwordScore: number;
  passwordChecks: {
    length: boolean;
    cases: boolean;
    numbers: boolean;
  };
  passwordError: string | null;
  currentPasswordError: string | null;
  onPasswordChange: (value: string) => void;
  onCurrentPasswordChange: (value: string) => void;
  onVerifyPassword: () => void;
  onChangePasswordClick: () => void;
  onPasswordChangeCancel: () => void;
}

export default function PasswordSection({
  isSocialLogin,
  isEditing,
  currentPassword,
  password,
  isVerifyingPassword,
  isChangingPassword,
  passwordScore,
  passwordChecks,
  passwordError,
  currentPasswordError,
  onPasswordChange,
  onCurrentPasswordChange,
  onVerifyPassword,
  onChangePasswordClick,
  onPasswordChangeCancel,
}: PasswordSectionProps) {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700">
          비밀번호
        </label>
        {!isSocialLogin &&
          isEditing &&
          !isVerifyingPassword &&
          !isChangingPassword && (
            <button
              onClick={onChangePasswordClick}
              className="text-sm text-[#49BEB7] hover:text-[#3ea9a2] font-medium"
            >
              비밀번호 변경
            </button>
          )}
        {!isSocialLogin &&
          isEditing &&
          (isVerifyingPassword || isChangingPassword) && (
            <button
              onClick={onPasswordChangeCancel}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              취소
            </button>
          )}
      </div>

      {!isSocialLogin ? (
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
          <div className="space-y-3">
            <input
              type="password"
              placeholder="현재 비밀번호를 입력하세요"
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
              className={`w-full p-2 border rounded-md ${
                currentPasswordError
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
              }`}
              onKeyPress={(e) => {
                if (e.key === "Enter" && currentPassword) {
                  onVerifyPassword();
                }
              }}
            />
            {currentPasswordError && (
              <p className="text-sm text-red-600">{currentPasswordError}</p>
            )}
            <button
              onClick={onVerifyPassword}
              disabled={!currentPassword.trim()}
              className="px-4 py-2 bg-[#49BEB7] hover:bg-[#3ea9a2] disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
            >
              확인
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="password"
              placeholder="새 비밀번호 입력"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
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
                <PasswordCheckItem
                  isChecked={passwordChecks.length}
                  text="8자 이상"
                />
                <PasswordCheckItem
                  isChecked={passwordChecks.cases}
                  text="영문 대소문자 포함"
                />
                <PasswordCheckItem
                  isChecked={passwordChecks.numbers}
                  text="숫자 포함"
                />
              </ul>

              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
              {passwordScore === 3 && (
                <p className="text-sm text-green-600">안전한 비밀번호입니다!</p>
              )}
            </div>
          </div>
        )
      ) : (
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
  );
}

function PasswordCheckItem({
  isChecked,
  text,
}: {
  isChecked: boolean;
  text: string;
}) {
  return (
    <li
      className={`flex items-center ${
        isChecked ? "text-green-600" : "text-gray-500"
      }`}
    >
      {isChecked ? (
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
      <span>{text}</span>
    </li>
  );
}
