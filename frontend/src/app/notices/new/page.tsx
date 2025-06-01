"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface NoticeForm {
  title: string;
  content: string;
}

export default function CreateNoticePage() {
  const router = useRouter();
  const { user } = useUser();
  const [form, setForm] = useState<NoticeForm>({
    title: "",
    content: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 마운트 시점에 권한 체크
    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    if (user.userRole !== "ROLE_ADMIN") {
      alert("관리자만 공지사항을 작성할 수 있습니다.");
      router.push("/notices");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // ⭐ 디버깅 로그를 맨 앞으로 이동
    console.log("=== 디버깅 정보 ===");
    console.log(
      "NEXT_PUBLIC_API_BASE_URL:",
      process.env.NEXT_PUBLIC_API_BASE_URL
    );
    console.log(
      "최종 요청 URL:",
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notices`
    );
    console.log("사용자 정보:", user);
    console.log("폼 데이터:", form);

    // 입력값 검증
    if (!form.title.trim() || !form.content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      console.log("입력값 검증 실패 - 제목 또는 내용이 비어있음");
      return;
    }

    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    if (user.userRole !== "ROLE_ADMIN") {
      alert("관리자만 공지사항을 작성할 수 있습니다.");
      router.push("/notices");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      console.log("공지사항 등록 시작:", {
        title: form.title.trim(),
        content: form.content.trim(),
      });
      console.log("Creating notice with user:", user);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notices`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            title: form.title.trim(),
            content: form.content.trim(),
          }),
        }
      );

      console.log("서버 응답 상태:", response.status);
      console.log("응답 헤더:", response.headers.get("content-type"));

      if (!response.ok) {
        // 응답이 JSON인지 확인
        const contentType = response.headers.get("content-type");
        let errorMessage = "공지사항 등록에 실패했습니다.";

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            console.error("에러 응답 JSON 파싱 실패:", jsonError);
            errorMessage = await response.text();
          }
        } else {
          errorMessage = await response.text();
        }

        throw new Error(errorMessage);
      }

      // 성공 응답 처리
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error("성공 응답 JSON 파싱 실패:", jsonError);
          // JSON 파싱 실패해도 성공으로 처리
          data = { success: true };
        }
      } else {
        data = await response.text();
      }

      console.log("공지사항 등록 성공:", data);

      alert("공지사항이 등록되었습니다.");

      // 성공 시 목록으로 이동 (약간의 딜레이 후)
      setTimeout(() => {
        router.push("/notices");
      }, 500);
    } catch (error: any) {
      console.error("공지사항 등록 오류:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "공지사항 등록에 실패했습니다.";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // 로딩 중이거나 권한이 없으면 렌더링하지 않음
  if (!user || user.userRole !== "ROLE_ADMIN") {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
          disabled={submitting}
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          목록으로
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-teal-50 px-6 py-4 border-b border-teal-100">
          <h2 className="text-lg font-medium text-teal-700">공지사항 작성</h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    setError(null); // 입력 시 에러 메시지 제거
                  }}
                  placeholder="제목을 입력하세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => {
                    setForm({ ...form, content: e.target.value });
                    setError(null); // 입력 시 에러 메시지 제거
                  }}
                  placeholder="내용을 입력하세요"
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none disabled:bg-gray-100"
                  disabled={submitting}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting || !form.title.trim() || !form.content.trim()
                  }
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      등록 중...
                    </div>
                  ) : (
                    "등록하기"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
