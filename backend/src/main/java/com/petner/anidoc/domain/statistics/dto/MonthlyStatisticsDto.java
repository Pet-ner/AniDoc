package com.petner.anidoc.domain.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyStatisticsDto {
    private String period;
    private Long visitCount;
}
