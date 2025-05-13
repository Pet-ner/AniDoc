package com.petner.anidoc.domain.vet.reservation.dto;

import com.petner.anidoc.domain.vet.reservation.entity.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationStatusUpdateRequestDto {
    private ReservationStatus status;
}
