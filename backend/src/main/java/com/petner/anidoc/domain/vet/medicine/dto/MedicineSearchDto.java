package com.petner.anidoc.domain.vet.medicine.dto;

import com.petner.anidoc.domain.vet.medicine.entity.Medicine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MedicineSearchDto {
    private Long id;
    private String medicationName;
    private Integer stock;
    private boolean isAvailable; // 재고 있는지 여부

    public static MedicineSearchDto fromEntity(Medicine medicine) {
        return MedicineSearchDto.builder()
                .id(medicine.getId())
                .medicationName(medicine.getMedicationName())
                .stock(medicine.getStock())
                .isAvailable(medicine.isAvailable())
                .build();
    }
}