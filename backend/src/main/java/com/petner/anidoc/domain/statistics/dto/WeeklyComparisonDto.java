package com.petner.anidoc.domain.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyComparisonDto {
    private String LastWeekPeriod;
    private Long LastWeekVisitCount;

    private String thisWeekPeriod;
    private Long thisWeekVisitCount;

    private String trend;
    private String changeRate;
}
