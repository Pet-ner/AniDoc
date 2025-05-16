"use client";

import { useUser } from "@/contexts/UserContext";

export default function UserSwitcher() {
  const { user, login } = useUser();

  if (!user) return null;

  return (
    <div className="mb-4 p-3 bg-gray-100 rounded-lg">
      <p className="mb-2">
        현재 사용자: {user.name} (ID: {user.id}, Role: {user.role})
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => login(1)}
          className={`px-3 py-1 rounded ${
            user.id === 1 ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          일반 사용자
        </button>
        <button
          onClick={() => login(2)}
          className={`px-3 py-1 rounded ${
            user.id === 2 ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          의료진
        </button>
        <button
          onClick={() => login(3)}
          className={`px-3 py-1 rounded ${
            user.id === 3 ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          관리자
        </button>
      </div>
    </div>
  );
}
