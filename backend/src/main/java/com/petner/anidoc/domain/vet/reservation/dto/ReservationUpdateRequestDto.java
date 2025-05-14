package com.petner.anidoc.domain.vet.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationUpdateRequestDto {
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private String symptom;
}
