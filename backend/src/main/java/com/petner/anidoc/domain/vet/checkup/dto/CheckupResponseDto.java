package com.petner.anidoc.domain.vet.checkup.dto;

import com.petner.anidoc.domain.vet.checkup.entity.CheckupResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckupResponseDto {
    private Long id;

    private Long medicalRecordId;
    private String checkupType;
    private String result;
    private String resultUrl;
    private LocalDate checkupDate;
    private String status;

    public static CheckupResponseDto from(CheckupResult checkupResult) {
        return CheckupResponseDto.builder()
                .id(checkupResult.getId())
                .medicalRecordId(checkupResult.getMedicalRecord().getId())
                .checkupType(checkupResult.getCheckupType().name())
                .result(checkupResult.getResult())
                .resultUrl(checkupResult.getResultUrl())
                .checkupDate(checkupResult.getCheckupDate())
                .status(checkupResult.getStatus().name())
                .build();
    }

}
