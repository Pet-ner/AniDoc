package com.petner.anidoc.domain.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class AnimalTypeDto {
    private String period;
    private Long dogCount;
    private Long catCount;
    private Long otherCount;
    private Long totalCount;
}
