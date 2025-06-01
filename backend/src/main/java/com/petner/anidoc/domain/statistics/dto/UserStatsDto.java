package com.petner.anidoc.domain.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDto {
    private int todayReservations;           // 오늘 예약
    private int upcomingReservations;        // 예정된 예약 (오늘 미완료 + 미래 승인됨)
    private int pendingReservations;         // 승인 대기 예약
    private int totalPets;
    private int totalTreatments;
    private LocalDate lastVisitDate;
}
