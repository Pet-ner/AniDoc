package com.petner.anidoc.domain.vet.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorAssignRequestDto {
    private Long doctorId;
}
