"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import type { Medicine, MedicineStats } from "@/types/medicine";
import MedicineModal from "@/components/medicines/MedicineModal";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  PackageCheck,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function MedicineInventoryPage() {
  const router = useRouter();
  const { user } = useUser();
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "low" | "out">("all");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );

  // 권한 체크
  useEffect(() => {
    if (user && user.userRole !== "ROLE_ADMIN") {
      router.push("/");
    }
  }, [user, router]);

  // 초기 데이터 로딩
  useEffect(() => {
    if (user) {
      fetchAllMedicines();
    }
  }, [user]);

  // 전체 약품 데이터 조회
  const fetchAllMedicines = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medicines/all`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("약품 목록을 불러오는데 실패했습니다.");
      }

      const data: Medicine[] = await response.json();
      setAllMedicines(data);
    } catch (error) {
      console.error("약품 목록 로드 오류:", error);
      toast.error("약품 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 필터링 및 페이징
  const { filteredMedicines, displayedMedicines, totalPages, stats } =
    useMemo(() => {
      let filtered = allMedicines;

      // 검색 필터링
      if (search.trim()) {
        filtered = filtered.filter((medicine) =>
          medicine.medicationName
            .toLowerCase()
            .includes(search.toLowerCase().trim())
        );
      }

      // 재고 상태 필터링
      if (filterType === "low") {
        filtered = filtered.filter(
          (medicine) => medicine.stock > 0 && medicine.stock <= 10
        );
      } else if (filterType === "out") {
        filtered = filtered.filter((medicine) => medicine.stock === 0);
      }

      // 페이징 계산
      const totalPages = Math.ceil(filtered.length / pageSize);
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      const displayed = filtered.slice(startIndex, endIndex);

      // 통계 계산
      const stats = allMedicines.reduce(
        (acc, medicine) => {
          acc.totalItems++;
          if (medicine.stock === 0) {
            acc.outOfStockItems++;
          } else if (medicine.stock <= 10) {
            acc.lowStockItems++;
          }
          return acc;
        },
        {
          totalItems: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          totalValue: 0,
        }
      );

      return {
        filteredMedicines: filtered,
        displayedMedicines: displayed,
        totalPages,
        stats,
      };
    }, [allMedicines, search, filterType, currentPage]);

  // 검색/필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(0);
  }, [search, filterType]);

  // 페이지 변경 처리
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 재고 상태 색상
  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return "text-red-700 bg-red-50 border-red-200";
    if (stock <= 10) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-green-700 bg-green-50 border-green-200";
  };

  // 재고 상태 텍스트
  const getStockStatusText = (stock: number) => {
    if (stock === 0) return "재고 없음";
    if (stock <= 10) return "재고 부족";
    return "정상";
  };

  // 약품 삭제
  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 약품을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medicines/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("약품 삭제에 실패했습니다.");
      }

      toast.success("약품이 삭제되었습니다.");

      // 전체 데이터 다시 로드
      fetchAllMedicines();
    } catch (error) {
      console.error("약품 삭제 오류:", error);
      toast.error("약품 삭제에 실패했습니다.");
    }
  };

  // 페이지네이션 버튼
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-xs rounded-lg transition-colors ${
            i === currentPage
              ? "bg-teal-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
          }`}
        >
          {i + 1}
        </button>
      );
    }

    return buttons;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 상단 통계 카드 */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="전체 약품"
          value={stats.totalItems}
          icon={<Package className="text-teal-500" />}
          bgColor="bg-teal-50"
        />
        <StatCard
          title="정상 재고"
          value={stats.totalItems - stats.lowStockItems - stats.outOfStockItems}
          icon={<PackageCheck className="text-green-500" />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="재고 부족"
          value={stats.lowStockItems}
          icon={<TrendingDown className="text-yellow-500" />}
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="재고 없음"
          value={stats.outOfStockItems}
          icon={<AlertTriangle className="text-red-500" />}
          bgColor="bg-red-50"
        />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* 컨트롤 바 */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between gap-4">
            {/* 필터 + 검색창 */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter
                  className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as "all" | "low" | "out")
                  }
                  className="pl-8 pr-7 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-700 min-w-[120px] appearance-none cursor-pointer shadow-sm"
                >
                  <option value="all">전체</option>
                  <option value="low">재고 부족</option>
                  <option value="out">재고 없음</option>
                </select>
                <ChevronDown
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={14}
                />
              </div>

              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="약품명 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-80 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm"
                />
              </div>
            </div>

            {/* 결과 카운터 + 추가 버튼 */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                <span className="ml-1">{filteredMedicines.length}개 약품</span>
                {(search || filterType !== "all") && (
                  <span className="text-gray-400 ml-1">
                    (전체 {stats.totalItems}개)
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-teal-600 transition-colors duration-200 shadow-sm"
              >
                <Plus size={16} />
                약품 추가
              </button>
            </div>
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  약품명
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  재고 수량
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  최종 수정일
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {displayedMedicines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Package size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium text-gray-500 mb-1">
                        {search || filterType !== "all"
                          ? "검색 결과가 없습니다"
                          : "등록된 약품이 없습니다"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {search || filterType !== "all"
                          ? "다른 검색어나 필터를 시도해보세요"
                          : "새로운 약품을 추가해보세요"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedMedicines.map((medicine, index) => (
                  <tr
                    key={medicine.id}
                    className={`transition-colors duration-150 hover:bg-blue-50/50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {medicine.medicationName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {medicine.stock}개
                        </span>
                        {medicine.stock <= 10 && medicine.stock > 0 && (
                          <div className="ml-3 p-1 rounded-full bg-yellow-100">
                            <AlertTriangle
                              className="text-yellow-600"
                              size={14}
                            />
                          </div>
                        )}
                        {medicine.stock === 0 && (
                          <div className="ml-3 p-1 rounded-full bg-red-100">
                            <AlertTriangle className="text-red-600" size={14} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStockStatusColor(
                          medicine.stock
                        )}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            medicine.stock === 0
                              ? "bg-red-500"
                              : medicine.stock <= 10
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        ></div>
                        {getStockStatusText(medicine.stock)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(medicine.updatedAt).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(medicine.updatedAt).toLocaleTimeString(
                          "ko-KR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMedicine(medicine);
                            setShowEditModal(true);
                          }}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
                          title="수정"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(medicine.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30">
            <div className="flex items-center justify-between">
              {/* 왼쪽 여백 */}
              <div className="flex-1"></div>

              {/* 페이지네이션 */}
              <div className="flex items-center space-x-1">
                {/* 이전 페이지 버튼 */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft size={14} />
                </button>

                {/* 페이지 번호 버튼들 */}
                <div className="flex items-center space-x-1">
                  {renderPaginationButtons()}
                </div>

                {/* 다음 페이지 버튼 */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* 페이지 정보 */}
              <div className="flex-1 flex justify-end">
                <div className="text-xs text-gray-500">
                  {filteredMedicines.length > 0 && (
                    <span>
                      {currentPage * pageSize + 1}-
                      {Math.min(
                        (currentPage + 1) * pageSize,
                        filteredMedicines.length
                      )}{" "}
                      / {filteredMedicines.length}개
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 추가/수정 모달 */}
      {(showAddModal || showEditModal) && (
        <MedicineModal
          isOpen={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedMedicine(null);
          }}
          medicine={selectedMedicine}
          onSave={() => {
            fetchAllMedicines(); // 전체 데이터 다시 로드
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedMedicine(null);
          }}
        />
      )}
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({
  title,
  value,
  icon,
  bgColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-lg shadow-sm p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
