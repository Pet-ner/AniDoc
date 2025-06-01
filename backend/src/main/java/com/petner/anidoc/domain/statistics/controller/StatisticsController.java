package com.petner.anidoc.domain.statistics.controller;

import com.petner.anidoc.domain.statistics.dto.*;
import com.petner.anidoc.domain.statistics.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@Tag(name = "통계", description = "통계 관련 API")
public class StatisticsController {

    private final StatisticsService statisticsService;

    //지난 주 방문자 통계
    @Operation(summary = "지난 주 방문자 통계")
    @GetMapping("/weekly")
    public WeeklyStatisticsDto getLastWeekStatistics(){
        return statisticsService.getLastWeekWeekStatistics();
    }

    //지난 달 방문자 통계
    @Operation(summary = "지난 달 방문자 통계")
    @GetMapping("/monthly")
    public MonthlyStatisticsDto getLastMonthStatistics(){
        return statisticsService.getLastMonthWeekStatistics();
    }

    //지난 주 - 이번 주 방문자 비교
    @Operation(summary = "주간 방문자 비교")
    @GetMapping("/weekly-comparison")
    public WeeklyComparisonDto getWeeklyComparison(){
        return statisticsService.getWeeklyComparison();
    }

    //지난 달 - 이번 달 방문자 비교
    @Operation(summary = "월간 방문자 비교")
    @GetMapping("/monthly-comparison")
    public MonthlyComparisonDto getMonthlyComparison(){
        return statisticsService.getMonthlyComparison();
    }


    //지난 달 동물 별 비율
    @Operation(summary = "지난 달 동물별 진료 비율 통계")
    @GetMapping("/monthly-animal-rate")
    public AnimalTypeDto getLastMonthAnimalRate(){
        return  statisticsService.getLastMonthAnimalTypeRate();
    }

    // 대시보드(상단통계카드)
    // 추가(보호자별 통계)
    @GetMapping("/users/{userId}")
    @Operation(summary = "보호자 개인 통계 조회")
    public ResponseEntity<UserStatsDto> getUserStats(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails currentUser) {

        UserStatsDto stats = statisticsService.getUserStats(userId, currentUser);
        return ResponseEntity.ok(stats);
    }
    //추가(의료진, 관리자)
    // 관리자 대시보드 통계
    @GetMapping("/admin/dashboard")
    @Operation(summary = "관리자 대시보드 통계 조회")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<AdminStatsDto> getAdminDashboardStats(
            @AuthenticationPrincipal UserDetails currentUser) {

        AdminStatsDto stats = statisticsService.getAdminDashboardStats(currentUser);
        return ResponseEntity.ok(stats);
    }

    // 의료진 대시보드 통계 (수정됨)
    @GetMapping("/staff/dashboard")
    @Operation(summary = "의료진 대시보드 통계 조회")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<StaffStatsDto> getStaffDashboardStats(
            @AuthenticationPrincipal UserDetails currentUser) {

        StaffStatsDto stats = statisticsService.getStaffDashboardStats(currentUser);
        return ResponseEntity.ok(stats);
    }
}
