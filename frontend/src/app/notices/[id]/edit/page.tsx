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
          이전으로
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="제목을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="내용을 입력하세요"
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  {submitting ? "처리 중..." : "수정하기"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
