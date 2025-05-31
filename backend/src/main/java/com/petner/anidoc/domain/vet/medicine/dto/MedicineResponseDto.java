package com.petner.anidoc.domain.vet.medicine.dto;

import com.petner.anidoc.domain.vet.medicine.entity.Medicine;
import lombok.*;

import java.time.format.DateTimeFormatter;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MedicineResponseDto {
    private Long id;
    private String medicationName;
    private Integer stock;
    private String vetName;
    private Long vetInfoId;
    private String createdAt;
    private String updatedAt;

    public static MedicineResponseDto fromEntity(Medicine medicine) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return MedicineResponseDto.builder()
                .id(medicine.getId())
                .medicationName(medicine.getMedicationName())
                .stock(medicine.getStock())
                .vetName(medicine.getVetInfo().getVetName())
                .vetInfoId(medicine.getVetInfo().getId())
                .createdAt(medicine.getCreatedAt().format(formatter))
                .updatedAt(medicine.getUpdatedAt().format(formatter))
                .build();
    }
}