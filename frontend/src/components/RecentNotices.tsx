"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Megaphone } from "lucide-react";

interface Notice {
  id: number;
  title: string;
  writer: string;
  createdAt: string;
}

export default function RecentNotices() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentNotices();
  }, []);

  const fetchRecentNotices = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notices?page=0&size=4`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("공지사항을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setNotices(data.content);
    } catch (error) {
      console.error("공지사항 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeClick = (noticeId: number) => {
    // 메인 페이지에서 접근했다는 표시로 '/' 저장
    sessionStorage.setItem("prevPath", "/");
    router.push(`/notices/${noticeId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">공지사항</h2>
      </div>
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-gray-500 py-4">로딩 중...</p>
        ) : notices.length === 0 ? (
          <p className="text-center text-gray-500 py-4">공지사항이 없습니다.</p>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className="border-b border-gray-100 pb-2 last:border-0"
            >
              <Link
                href={`/notices/${notice.id}`}
                className="block py-1 hover:text-[#49BEB7] text-gray-800"
                onClick={(e) => {
                  e.preventDefault();
                  handleNoticeClick(notice.id);
                }}
              >
                <div className="flex items-center gap-2">
                  <Megaphone
                    className="text-blue-500 flex-shrink-0"
                    size={20}
                  />{" "}
                  {/* size를 16에서 20으로 변경 */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate" title={notice.title}>
                      {notice.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notice.createdAt).toISOString().split("T")[0]}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
      <div className="mt-3 text-center">
        <Link
          href="/notices"
          className="text-sm text-[#49BEB7] hover:underline"
        >
          모든 공지사항 보기
        </Link>
      </div>
    </div>
  );
}
