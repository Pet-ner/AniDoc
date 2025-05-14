package com.petner.anidoc.domain.vet.reservation.dto;

import com.petner.anidoc.domain.vet.reservation.entity.ReservationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReservationRequestDto {
    private Long petId;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private String symptom;
    private ReservationType type;
}
