package com.petner.anidoc.domain.vet.hospitalizationrecord.dto;

import com.petner.anidoc.domain.vet.hospitalizationrecord.entity.HospitalizationRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class HospitalizationRecordResponseDto {
    private Long id;

    private Long medicalRecordId;
    private Long petId;

    private LocalDate admissionDate; //입원일자
    private LocalDate dischargeDate; //퇴원일자

    private String reason;
    private String imageUrl;

    public static HospitalizationRecordResponseDto from(HospitalizationRecord hospitalizationRecord) {
        return HospitalizationRecordResponseDto.builder()
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
