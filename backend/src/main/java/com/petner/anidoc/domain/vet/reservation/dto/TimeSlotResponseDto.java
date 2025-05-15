package com.petner.anidoc.domain.vet.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeSlotResponseDto {
    private LocalTime time;
    private boolean available;
}
