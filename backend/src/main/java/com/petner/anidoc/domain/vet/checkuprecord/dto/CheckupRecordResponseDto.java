package com.petner.anidoc.domain.vet.checkuprecord.dto;

import com.petner.anidoc.domain.vet.checkuprecord.entity.CheckupRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckupRecordResponseDto {
    private Long id;

    private Long medicalRecordId;
    private String checkupType;
    private String result;
    private String resultUrl;
    private LocalDate checkupDate;

    public static CheckupRecordResponseDto from(CheckupRecord checkupRecord) {
        return CheckupRecordResponseDto.builder()
                .id(checkupRecord.getId())
                .medicalRecordId(checkupRecord.getMedicalRecord().getId())
                .checkupType(checkupRecord.getCheckupType().name())
                .result(checkupRecord.getResult())
                .resultUrl(checkupRecord.getResultUrl())
                .checkupDate(checkupRecord.getCheckupDate())
                .build();
    }

}
