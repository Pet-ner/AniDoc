// types/statistics.ts
export interface WeeklyComparisonDto {
  lastWeekPeriod: string;
  lastWeekVisitCount: number; // ← 변경
  thisWeekPeriod: string;
  thisWeekVisitCount: number; // ← 변경
  trend: string;
  changeRate: string;
}

export interface MonthlyComparisonDto {
  lastMonthPeriod: string;
  lastMonthVisitCount: number; // ← 변경
  thisMonthPeriod: string;
  thisMonthVisitCount: number; // ← 변경
  trend: string;
  changeRate: string;
}

export interface AnimalRatioDto {
  period: string;
  dogCount: number;
  catCount: number;
  otherCount: number;
  totalCount: number;
}
