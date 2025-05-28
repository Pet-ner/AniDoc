package com.petner.anidoc.domain.vet.checkuprecord.dto;


import com.petner.anidoc.domain.vet.checkuprecord.entity.CheckupStatus;
import com.petner.anidoc.domain.vet.checkuprecord.entity.CheckupType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CheckupRecordRequestDto {
    private Long medicalRecordId;
    private CheckupType checkupType;
    private String result;
    private String resultUrl;
    private LocalDate checkupDate;
//    private CheckupStatus status;

}
