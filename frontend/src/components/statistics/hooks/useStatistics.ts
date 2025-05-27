// hooks/useStatistics.ts
import { useState, useEffect } from "react";
import {
  WeeklyComparisonDto,
  MonthlyComparisonDto,
  AnimalRatioDto,
} from "../types/statistics";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useWeeklyComparison = () => {
  const [data, setData] = useState<WeeklyComparisonDto>({
    lastWeekPeriod: "",
    lastWeekVisitCount: 0, // ← 변경
    thisWeekPeriod: "",
    thisWeekVisitCount: 0, // ← 변경
    trend: "",
    changeRate: "0%",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/statistics/weekly-comparison`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("주간 통계 조회 실패");
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "주간 통계 로드 실패"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export const useMonthlyComparison = () => {
  const [data, setData] = useState<MonthlyComparisonDto>({
    lastMonthPeriod: "",
    lastMonthVisitCount: 0, // ← 변경
    thisMonthPeriod: "",
    thisMonthVisitCount: 0, // ← 변경
    trend: "",
    changeRate: "0%",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/statistics/monthly-comparison`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("월간 통계 조회 실패");
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "월간 통계 로드 실패"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export const useAnimalRatio = () => {
  const [data, setData] = useState<AnimalRatioDto>({
    period: "",
    dogCount: 0,
    catCount: 0,
    otherCount: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/statistics/monthly-animal-rate`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("동물 비율 통계 조회 실패");
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "동물 비율 통계 로드 실패"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
