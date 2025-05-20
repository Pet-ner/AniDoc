"use client";

import { useUser } from "@/contexts/UserContext";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Notice {
  id: number;
  title: string;
  content: string;
  writer: string;
  createdAt: string;
}

export default function NoticeDetailPage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notices/${params.id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("공지사항을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setNotice(data);
      } catch (error) {
        console.error("공지사항 로드 오류:", error);
        alert("공지사항을 불러오는데 실패했습니다.");
        router.push("/notices");
      }
    };

    fetchNotice();
  }, [params.id, router]);

  if (!notice) return null;

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
        {user?.userRole === "ROLE_ADMIN" && (
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/notices/${notice.id}/edit`)}
              className="inline-flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              <Pencil className="w-4 h-4 mr-2" />
              수정
            </button>
            <button
              onClick={async () => {
                if (confirm("정말 삭제하시겠습니까?")) {
                  try {
                    const response = await fetch(
                      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notices/${notice.id}`,
                      {
                        method: "DELETE",
                        credentials: "include",
                        headers: {
                          "Content-Type": "application/json",
                        },
                      }
                    );

                    if (!response.ok) {
                      throw new Error("공지사항 삭제에 실패했습니다.");
                    }

                    alert("공지사항이 삭제되었습니다.");
                    router.push("/notices");
                  } catch (error) {
                    console.error("공지사항 삭제 오류:", error);
                    alert("공지사항 삭제에 실패했습니다.");
                  }
                }
              }}
              className="inline-flex items-center px-4 py-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {notice.title}
          </h1>
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-4">작성자: {notice.writer}</span>
            <span>작성일: {notice.createdAt}</span>
          </div>
        </div>
        <div className="p-6">
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
              {notice.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
