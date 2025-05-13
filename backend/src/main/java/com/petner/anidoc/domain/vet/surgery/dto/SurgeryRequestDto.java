package com.petner.anidoc.domain.vet.surgery.dto;

import com.petner.anidoc.domain.vet.surgery.entity.AnesthesiaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SurgeryRequestDto {
    private Long medicalRecordId;
    private Long petId;

    private String surgeryName;
    private LocalDate surgeryDate;
    private AnesthesiaType anesthesiaType;
    private String surgeryNote;

}
