"use client";

import { useState } from "react";
import ProfileSidebar from "@/components/ProfileSidebar";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    hospital: "아프지말개 동물병원",
    phone: "010-1234-5678",
    emergencyPhone: "010-8765-4321",
  });

  const handleSave = () => {
    // TODO: API 호출하여 데이터 저장
    setIsEditing(false);
  };

  const handleCancel = () => {
    // 편집 취소 시 원래 데이터로 복구
    setFormData({
      password: "",
      hospital: "아프지말개 동물병원",
      phone: "010-1234-5678",
      emergencyPhone: "010-8765-4321",
    });
    setIsEditing(false);
  };

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
                value="lee.hojun@anidoc.kr"
                className="w-full p-2 border rounded-md bg-gray-50 text-gray-500"
                readOnly
              />
              <p className="mt-1 text-sm text-gray-500">
                이메일은 변경할 수 없습니다.
              </p>
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                placeholder={isEditing ? "새 비밀번호 입력" : "********"}
                value={isEditing ? formData.password : "********"}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`w-full p-2 border rounded-md ${
                  isEditing ? "bg-white" : "bg-gray-50"
                }`}
                readOnly={!isEditing}
              />
            </div>
            {/* Hospital */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                소속
              </label>
              <input
                type="text"
                value={formData.hospital}
                onChange={(e) =>
                  setFormData({ ...formData, hospital: e.target.value })
                }
                className={`w-full p-2 border rounded-md ${
                  isEditing ? "bg-white" : "bg-gray-50"
                }`}
                readOnly={!isEditing}
              />
            </div>
            {/* Contact Info Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연락처
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
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
                  value={formData.emergencyPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyPhone: e.target.value })
                  }
                  className={`w-full p-2 border rounded-md ${
                    isEditing ? "bg-white" : "bg-gray-50"
                  }`}
                  readOnly={!isEditing}
                />
              </div>
            </div>{" "}
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
