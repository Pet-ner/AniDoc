package com.petner.anidoc.domain.vet.surgeryrecord.dto;


import com.petner.anidoc.domain.vet.surgeryrecord.entity.SurgeryRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurgeryRecordResponseDto {
    private Long id;

    private Long medicalRecordId;
    private Long petId;
    private String surgeryName;
    private LocalDate surgeryDate;
    private String anesthesiaType;
    private String surgeryNote;

    public static SurgeryRecordResponseDto from(SurgeryRecord surgeryRecord){
        return SurgeryRecordResponseDto.builder()
                .id(surgeryRecord.getId())
                .medicalRecordId(surgeryRecord.getMedicalRecord().getId())
                .petId(surgeryRecord.getPet().getId())
                .surgeryName(surgeryRecord.getSurgeryName())
                .surgeryDate(surgeryRecord.getSurgeryDate())
                .anesthesiaType(surgeryRecord.getAnesthesiaType().name())
                .surgeryNote(surgeryRecord.getSurgeryNote())
                .build();
    }
}
