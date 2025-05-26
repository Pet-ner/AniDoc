package com.petner.anidoc.domain.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyComparisonDto {
    private String lastMonthPeriod;
    private Long lastMonthVisitCount;

    private String thisMonthPeriod;
    private Long thisMonthVisitCount;

    private String trend;
    private String changeRate;
}
