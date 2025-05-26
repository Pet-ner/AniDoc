package com.petner.anidoc.domain.statistics.controller;

import com.petner.anidoc.domain.statistics.dto.*;
import com.petner.anidoc.domain.statistics.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
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

}
