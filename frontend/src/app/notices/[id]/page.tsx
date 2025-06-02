"use client";

import { useUser } from "@/contexts/UserContext";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

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
  const [fromNoticesList, setFromNoticesList] = useState(false);

  useEffect(() => {
    // 이전 경로 체크 로직 수정
    const prevPath = sessionStorage.getItem("prevPath");
    // 공지사항 목록 페이지에서 왔는지 체크
    // 메인 페이지('/')에서 왔을 때는 false
    setFromNoticesList(prevPath === "/notices");

    const fetchNotice = async () => {
      try {
        if (!params.id) return; // ID가 없으면 리턴

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notices/${params.id}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("존재하지 않는 공지사항입니다.");
          }
          throw new Error("공지사항을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setNotice(data);
      } catch (error) {
        console.error("공지사항 로드 오류:", error);
        toast.error("공지사항을 불러오는데 실패했습니다.");
        router.push("/notices");
      }
    };

    fetchNotice();
  }, [params.id, router]);

  const handleBackClick = () => {
    const prevPath = sessionStorage.getItem("prevPath");
    if (prevPath === "/notices") {
      // 공지사항 목록에서 왔을 때
      router.push("/notices");
    } else {
      // 메인 페이지나 다른 페이지에서 왔을 때
      router.back();
    }
  };

  if (!notice) return null;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBackClick}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          {fromNoticesList ? "목록으로" : "이전으로"}
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

                    toast.success("공지사항이 삭제되었습니다.");
                    router.push("/notices");
                  } catch (error) {
                    console.error("공지사항 삭제 오류:", error);
                    toast.error("공지사항 삭제에 실패했습니다.");
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
            <span>
              작성일:{" "}
              {new Date(notice.createdAt)
                .toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
                .replace(/\. /g, "-")
                .replace(".", "")
                .replace(/-(\d{2}:)/, " $1")}{" "}
              {/* 날짜와 시간 사이의 하이픈을 공백으로 변경 */}
            </span>
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
