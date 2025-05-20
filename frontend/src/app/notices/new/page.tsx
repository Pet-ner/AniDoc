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
      // console.log 추가하여 디버깅
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
            title: form.title,
            content: form.content,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "공지사항 등록에 실패했습니다.");
      }

      alert("공지사항이 등록되었습니다.");
      router.push("/notices");
    } catch (error) {
      console.error("공지사항 등록 오류:", error);
      alert(
        error instanceof Error ? error.message : "공지사항 등록에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          목록으로
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">공지사항 작성</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              제목
            </label>
            <input
              type="text"
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              내용
            </label>
            <textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? "처리 중..." : "등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
