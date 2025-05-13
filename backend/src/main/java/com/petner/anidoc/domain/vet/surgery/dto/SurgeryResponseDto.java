package com.petner.anidoc.domain.vet.surgery.dto;


import com.petner.anidoc.domain.vet.surgery.entity.Surgery;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurgeryResponseDto {
    private Long id;

    private Long medicalRecordId;
    private Long petId;
    private String surgeryName;
    private LocalDate surgeryDate;
    private String anesthesiaType;
    private String surgeryNote;

    public static SurgeryResponseDto from(Surgery surgery){
        return SurgeryResponseDto.builder()
                .id(surgery.getId())
                .medicalRecordId(surgery.getMedicalRecord().getId())
                .petId(surgery.getPet().getId())
                .surgeryName(surgery.getSurgeryName())
                .surgeryDate(surgery.getSurgeryDate())
                .anesthesiaType(surgery.getAnesthesiaType().name())
                .surgeryNote(surgery.getSurgeryNote())
                .build();
    }
}
