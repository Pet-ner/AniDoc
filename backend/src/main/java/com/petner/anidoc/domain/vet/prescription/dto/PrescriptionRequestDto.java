package com.petner.anidoc.domain.vet.prescription.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PrescriptionRequestDto {

    @NotNull(message = "약품 ID는 필수입니다.")
    private Long medicineId;

    @NotNull(message = "처방 수량은 필수입니다.")
    @Min(value = 1, message = "처방 수량은 1 이상이어야 합니다.")
    private Integer quantity;

    @Size(max = 100, message = "복용법은 100자 이하로 입력해주세요.")
    private String dosage;
}