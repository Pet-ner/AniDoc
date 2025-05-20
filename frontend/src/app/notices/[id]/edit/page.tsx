"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface NoticeForm {
  title: string;
  content: string;
}

// API 호출 함수
async function fetchWithRetry(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // 401 에러가 발생하면 헤더를 제거하고 재시도
    if (response.status === 401) {
      const { headers, ...restOptions } = options;
      const fallbackResponse = await fetch(url, {
        ...restOptions,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return fallbackResponse;
    }

    return response;
  } catch (error) {
    throw error;
  }
}

export default function EditNoticePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const [form, setForm] = useState<NoticeForm>({
    title: "",
    content: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 관리자 권한 체크
    if (!user || user.userRole !== "ROLE_ADMIN") {
      alert("관리자만 접근할 수 있습니다.");
      router.push("/notices");
      return;
    }

    const fetchNotice = async () => {
      try {
        const response = await fetchWithRetry(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notices/${params.id}`
        );

        if (!response.ok) {
          throw new Error("공지사항을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setForm({
          title: data.title,
          content: data.content,
        });
      } catch (error) {
        console.error("공지사항 로드 오류:", error);
        alert("공지사항을 불러오는데 실패했습니다.");
        router.push("/notices");
      }
    };

    fetchNotice();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const response = await fetchWithRetry(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notices/${params.id}`,
        {
          method: "PUT",
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("공지사항 수정에 실패했습니다.");
      }

      alert("공지사항이 수정되었습니다.");
      router.push(`/notices/${params.id}`);
    } catch (error) {
      console.error("공지사항 수정 오류:", error);
      alert("공지사항 수정에 실패했습니다.");
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
        <h1 className="text-2xl font-semibold mb-6">공지사항 수정</h1>
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
              {submitting ? "처리 중..." : "수정하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
