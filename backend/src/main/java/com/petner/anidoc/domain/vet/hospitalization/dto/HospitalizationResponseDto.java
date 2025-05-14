package com.petner.anidoc.domain.vet.hospitalization.dto;

import com.petner.anidoc.domain.vet.hospitalization.entity.HospitalizationRecord;
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

    public static HospitalizationResponseDto from(HospitalizationRecord hospitalizationRecord) {
        return HospitalizationResponseDto.builder()
                .id(hospitalizationRecord.getId())
                .medicalRecordId(hospitalizationRecord.getMedicalRecord().getId())
                .petId(hospitalizationRecord.getPet().getId())
                .admissionDate(hospitalizationRecord.getAdmissionDate())
                .dischargeDate(hospitalizationRecord.getDischargeDate())
                .reason(hospitalizationRecord.getReason())
                .imageUrl(hospitalizationRecord.getImageUrl())
                .build();
    }
}
