// components/VisitStats.tsx
import {
  useWeeklyComparison,
  useMonthlyComparison,
} from "../hooks/useStatistics";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import StatCard from "./StatCard";

export default function VisitStats() {
  const {
    data: weeklyData,
    loading: weeklyLoading,
    error: weeklyError,
  } = useWeeklyComparison();
  const {
    data: monthlyData,
    loading: monthlyLoading,
    error: monthlyError,
  } = useMonthlyComparison();

  const loading = weeklyLoading || monthlyLoading;
  const error = weeklyError || monthlyError;

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "증가":
        return "text-green-600";
      case "감소":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "증가":
        return <TrendingUp size={16} className="text-green-600" />;
      case "감소":
        return <TrendingDown size={16} className="text-red-600" />;
      default:
        return <Minus size={16} className="text-gray-500" />;
    }
  };

  // 막대그래프용 최대값 계산
  const getMaxValue = (data1: number, data2: number) => {
    const max = Math.max(data1, data2);
    return max === 0 ? 1 : max;
  };

  const weeklyMax = getMaxValue(
    weeklyData.lastWeekVisitCount,
    weeklyData.thisWeekVisitCount
  );
  const monthlyMax = getMaxValue(
    monthlyData.lastMonthVisitCount,
    monthlyData.thisMonthVisitCount
  );

  return (
    <StatCard
      title="방문 통계"
      icon={<TrendingUp size={18} className="text-teal-600" />}
      loading={loading}
      error={error}
    >
      <div className="space-y-6">
        {/* 주간 통계 - 혼합 방식 */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">주간 비교</h4>
            <div className="flex items-center gap-1">
              {getTrendIcon(weeklyData.trend)}
              <span
                className={`text-sm font-semibold ${getTrendColor(
                  weeklyData.trend
                )}`}
              >
                {weeklyData.changeRate}
              </span>
            </div>
          </div>

          {/* 막대그래프 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">지난주</span>
              <span className="text-sm font-bold text-gray-800">
                {weeklyData.lastWeekVisitCount}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-400 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    (weeklyData.lastWeekVisitCount / weeklyMax) * 100
                  }%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">이번주</span>
              <span className="text-sm font-bold text-teal-600">
                {weeklyData.thisWeekVisitCount}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    (weeklyData.thisWeekVisitCount / weeklyMax) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 월간 통계 - 혼합 방식 */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">월간 비교</h4>
            <div className="flex items-center gap-1">
              {getTrendIcon(monthlyData.trend)}
              <span
                className={`text-sm font-semibold ${getTrendColor(
                  monthlyData.trend
                )}`}
              >
                {monthlyData.changeRate}
              </span>
            </div>
          </div>

          {/* 막대그래프 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">지난달</span>
              <span className="text-sm font-bold text-gray-800">
                {monthlyData.lastMonthVisitCount}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-400 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    (monthlyData.lastMonthVisitCount / monthlyMax) * 100
                  }%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">이번달</span>
              <span className="text-sm font-bold text-teal-600">
                {monthlyData.thisMonthVisitCount}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    (monthlyData.thisMonthVisitCount / monthlyMax) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </StatCard>
  );
}
