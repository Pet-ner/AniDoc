package com.petner.anidoc.domain.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffStatsDto {
    private int todayMyReservations;        // 해당 의료진의 오늘 예약
    private int myTreatedPets;              // 해당 의료진이 진료한 고유 반려동물 수
    private int pendingReservations;        // 승인 대기 예약 수 (동일)
    private int weeklyMyTreatments;         // 해당 의료진의 주간 진료 수
    private int weeklyVaccinations; // 추가(주간예방접종)
}
