package com.petner.anidoc.domain.vet.reservation.dto;

import com.petner.anidoc.domain.vet.reservation.entity.ReservationStatus;
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
public class ReservationResponseDto {
    private Long id;
    private Long userId;
    private String userName;
    private Long petId;
    private String petName;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private ReservationStatus status;
    private String symptom;
    private ReservationType type;
    private String createdAt;
    private String updatedAt;
}
