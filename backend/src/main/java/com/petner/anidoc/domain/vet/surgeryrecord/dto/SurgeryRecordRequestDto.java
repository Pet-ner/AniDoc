package com.petner.anidoc.domain.vet.surgeryrecord.dto;

import com.petner.anidoc.domain.vet.surgeryrecord.entity.AnesthesiaType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SurgeryRecordRequestDto {
    private Long id;
    private Long medicalRecordId;
    private Long petId;

    private String surgeryName;
    private LocalDate surgeryDate;
    private AnesthesiaType anesthesiaType;
    private String surgeryNote;

}
