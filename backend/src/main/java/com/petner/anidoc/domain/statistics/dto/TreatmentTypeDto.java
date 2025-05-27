package com.petner.anidoc.domain.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class TreatmentTypeDto {
    private String period;
    private Long generalCount; // 일반진료 개수
    private Long vaccinationCount; // 예방접종 개수
    private Long totalCount;
}
