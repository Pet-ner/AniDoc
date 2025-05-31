package com.petner.anidoc.domain.vet.hospitalizationrecord.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class HospitalizationRecordRequestDto {
    private Long id;
    private Long medicalRecordId;
    private Long petId;

    private LocalDate admissionDate;
    private LocalDate dischargeDate;
    private String reason;
    private String imageUrl;
}
