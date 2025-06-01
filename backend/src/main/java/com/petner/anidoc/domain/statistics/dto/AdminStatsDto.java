package com.petner.anidoc.domain.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private int todayTotalReservations;     // 당일 전체 예약 수
    private int totalPets;                  // 총 반려동물 수
    private int pendingReservations;        // 승인 대기 예약 수
    private int weeklyCompletedTreatments;  // 7일간 진료 완료 건수
    private int recentVaccinations; // 추가(최근예방접종)
}
