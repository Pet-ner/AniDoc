"use client";

import { useUser } from "@/contexts/UserContext";
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";

interface Notice {
  id: number;
  title: string;
  writer: string;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// 공지사항 컨텐츠 컴포넌트
function NoticesContent() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageData, setPageData] = useState<PageResponse<Notice>>({
    content: [],
    totalPages: 1,
    totalElements: 0,
    size: 10,
    number: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = 10;

  // fetchNotices 함수를 useCallback으로 감싸서 재사용
  const fetchNotices = useCallback(async () => {
    try {
      console.log("데이터 가져오기 시작");
      setLoading(true);
      setError(null);

      const apiUrl = searchQuery
        ? `${
            process.env.NEXT_PUBLIC_API_BASE_URL
          }/api/notices/search?title=${encodeURIComponent(searchQuery)}&page=${
            currentPage - 1
          }&size=${pageSize}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notices?page=${
            currentPage - 1
          }&size=${pageSize}`;

      console.log("API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "공지사항이 없습니다."
            : "공지사항을 불러오는데 실패했습니다."
        );
      }

      const data = await response.json();
      setPageData(data);
    } catch (error) {
      console.error("공지사항 로드 오류:", error);
      setError(
        error instanceof Error
          ? error.message
          : "공지사항을 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  // 최초 마운트와 페이지/검색어 변경 시 실행
  useEffect(() => {
    fetchNotices();
  }, [currentPage, searchQuery, fetchNotices]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    setSearchQuery(query);
    router.push("/notices?page=1");
  };

  const handlePageChange = (page: number) => {
    router.push(
      `/notices?page=${page}${searchQuery ? `&search=${searchQuery}` : ""}`
    );
  };

  useEffect(() => {
    // 공지사항 목록 페이지에 진입할 때마다 경로 저장
    sessionStorage.setItem("prevPath", "/notices");
  }, []);

  const handleNoticeClick = (noticeId: number) => {
    // 상세 페이지로 이동하기 전에 현재 경로를 저장
    sessionStorage.setItem("prevPath", "/notices");
    router.push(`/notices/${noticeId}`);
  };

  // SSE 이벤트 리스너 (의존성 배열 비움)
  useEffect(() => {
    const handleNoticeRefresh = (e: Event) => {
      console.log("[Notice] 공지사항 새로고침 이벤트 수신");
      const customEvent = e as CustomEvent;
      console.log("[Notice] 이벤트 상세:", customEvent.detail);

      // 현재 페이지가 1페이지가 아니면 1페이지로 이동
      if (currentPage !== 1) {
        console.log("[Notice] 1페이지로 이동");
        router.push("/notices?page=1");
        return;
      }

      // 1페이지인 경우 즉시 새로고침
      console.log("[Notice] 즉시 새로고침 실행");
      fetchNotices();
    };

    window.addEventListener("notice-refresh", handleNoticeRefresh);
    console.log("[Notice] 이벤트 리스너 등록됨");

    return () => {
      window.removeEventListener("notice-refresh", handleNoticeRefresh);
      console.log("[Notice] 이벤트 리스너 제거됨");
    };
  }, []); // 빈 의존성 배열로 한 번만 등록

  return (
    <div className="p-8">
      {/* 검색 폼과 버튼을 포함한 상단 영역 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              name="search"
              placeholder="제목 검색"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              defaultValue={searchQuery}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              검색
            </button>
          </form>
        </div>
        {user?.userRole === "ROLE_ADMIN" && (
          <Link
            href="/notices/new"
            className="inline-flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            공지사항 작성
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {error && (
          <div className="p-4 text-red-500 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                작성자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                작성일
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  로딩 중...
                </td>
              </tr>
            ) : pageData.content.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  공지사항이 없습니다.
                </td>
              </tr>
            ) : (
              pageData.content.map((notice) => (
                <tr
                  key={notice.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleNoticeClick(notice.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pageData.number * pageData.size +
                      pageData.content.indexOf(notice) +
                      1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {notice.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {notice.writer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(notice.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        {!loading && pageData.content.length > 0 && (
          <div className="flex justify-center py-4">
            <nav className="flex items-center">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md mr-2 text-gray-500 disabled:text-gray-300"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from(
                  { length: pageData.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                      currentPage === page
                        ? "bg-[#49BEB7] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  handlePageChange(
                    Math.min(currentPage + 1, pageData.totalPages)
                  )
                }
                disabled={currentPage === pageData.totalPages}
                className="p-1 rounded-md ml-2 text-gray-500 disabled:text-gray-300"
              >
                <ChevronRight size={20} />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

// 메인 컴포넌트
export default function NoticesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex justify-center items-center">
          <div className="text-center text-gray-600">
            공지사항을 불러오는 중...
          </div>
        </div>
      }
    >
      <NoticesContent />
    </Suspense>
  );
}
