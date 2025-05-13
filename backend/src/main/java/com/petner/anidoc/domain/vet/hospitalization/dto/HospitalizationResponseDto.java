package com.petner.anidoc.domain.vet.hospitalization.dto;

import com.petner.anidoc.domain.vet.hospitalization.entity.Hospitalization;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class HospitalizationResponseDto {
    private Long id;

    private Long medicalRecordId;
    private Long petId;

    private LocalDate admissionDate; //입원일자
    private LocalDate dischargeDate; //퇴원일자

    private String reason;
    private String imageUrl;

    public static HospitalizationResponseDto from(Hospitalization hospitalization) {
        return HospitalizationResponseDto.builder()
                .id(hospitalization.getId())
                .medicalRecordId(hospitalization.getMedicalRecord().getId())
                .petId(hospitalization.getPet().getId())
                .admissionDate(hospitalization.getAdmissionDate())
                .dischargeDate(hospitalization.getDischargeDate())
                .reason(hospitalization.getReason())
                .imageUrl(hospitalization.getImageUrl())
                .build();
    }
}
