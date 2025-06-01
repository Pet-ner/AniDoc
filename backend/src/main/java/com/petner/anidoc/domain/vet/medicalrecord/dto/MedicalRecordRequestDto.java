package com.petner.anidoc.domain.vet.medicalrecord.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordRequestDto {
    private Long petId;
    private Long reservationId;
    private Long doctorId;

    private String age;
    private BigDecimal currentWeight;
    private String diagnosis; //진단내용
    private String treatment;
    private boolean isSurgery;
    private boolean isHospitalized;
    private boolean isCheckedUp;
    private boolean isDeleted;


}
