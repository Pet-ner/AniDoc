package com.petner.anidoc.domain.vet.prescription.dto;

import com.petner.anidoc.domain.vet.prescription.entity.Prescription;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PrescriptionResponseDto {

    private Long id;
    private Long medicalRecordId;
    private Long medicineId;
    private String medicationName;
    private Integer quantity;
    private String dosage;
    private String createdAt;
    private String updatedAt;

    public static PrescriptionResponseDto fromEntity(Prescription prescription) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return PrescriptionResponseDto.builder()
                .id(prescription.getId())
                .medicalRecordId(prescription.getMedicalRecord().getId())
                .medicineId(prescription.getMedicine().getId())
                .medicationName(prescription.getMedicine().getMedicationName())
                .quantity(prescription.getQuantity())
                .dosage(prescription.getDosage())
                .createdAt(prescription.getCreatedAt().format(formatter))
                .updatedAt(prescription.getUpdatedAt().format(formatter))
                .build();
    }
}