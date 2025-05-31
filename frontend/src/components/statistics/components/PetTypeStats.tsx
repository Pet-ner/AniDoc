// components/PetTypeStats.tsx
import { useAnimalRatio } from "../hooks/useStatistics";
import { PieChart } from "lucide-react";
import StatCard from "./StatCard";

export default function PetTypeStats() {
  const { data, loading, error } = useAnimalRatio();

  const calculatePercentage = (count: number, total: number): number => {
    if (total === 0) return 0;
    return (count / total) * 100;
  };

  const animalData = [
    {
      name: "강아지",
      count: data.dogCount,
      percentage: calculatePercentage(data.dogCount, data.totalCount),
      color: "#14b8a6",
      bgColor: "bg-teal-50",
    },
    {
      name: "고양이",
      count: data.catCount,
      percentage: calculatePercentage(data.catCount, data.totalCount),
      color: "#3b82f6",
      bgColor: "bg-blue-50",
    },
    {
      name: "기타",
      count: data.otherCount,
      percentage: calculatePercentage(data.otherCount, data.totalCount),
      color: "#a855f7",
      bgColor: "bg-purple-50",
    },
  ];

  // 반응형 텍스트 크기
  const getTextSize = (count: number) => {
    if (count >= 1000) return "text-xs";
    if (count >= 100) return "text-sm";
    if (count >= 10) return "text-sm";
    return "text-base";
  };

  return (
    <StatCard
      title="동물별 진료 비율"
      icon={<PieChart size={18} className="text-teal-500" />}
      loading={loading}
      error={error}
    >
      <div className="space-y-3">
        <div className="text-xs text-gray-500 text-center">{data.period}</div>

        <div className="flex items-center gap-4">
          {/* 도넛 차트 */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg
              viewBox="0 0 42 42"
              className="w-full h-full transform -rotate-90"
            >
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke="#f3f4f6"
                strokeWidth="3"
              />

              {(() => {
                let offset = 0;
                return animalData.map((animal, index) => {
                  if (animal.percentage === 0) return null;

                  const circumference = 2 * Math.PI * 15.915;
                  const strokeLength =
                    (animal.percentage / 100) * circumference;
                  const currentOffset = offset;
                  offset += strokeLength;

                  return (
                    <circle
                      key={animal.name}
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke={animal.color}
                      strokeWidth="3"
                      strokeDasharray={`${strokeLength} ${circumference}`}
                      strokeDashoffset={-currentOffset}
                      className="transition-all duration-700"
                      style={{
                        animationDelay: `${index * 150}ms`,
                      }}
                    />
                  );
                });
              })()}
            </svg>

            {/* 🎯 한 줄로 "총 숫자" 표시 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`font-bold text-gray-800 leading-none ${getTextSize(
                  data.totalCount
                )}`}
              >
                총 {data.totalCount}
              </div>
            </div>
          </div>

          {/* 범례 */}
          <div className="flex-1 space-y-2">
            {animalData.map((animal) => (
              <div
                key={animal.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: animal.color }}
                  />
                  <span className="text-xs font-medium text-gray-700">
                    {animal.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-800">
                    {animal.percentage.toFixed(0)}%
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({animal.count})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StatCard>
  );
}
