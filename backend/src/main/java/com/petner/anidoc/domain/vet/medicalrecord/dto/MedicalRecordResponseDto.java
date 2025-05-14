package com.petner.anidoc.domain.vet.medicalrecord.dto;

import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordResponseDto {
    private Long id;

    private String petName;
    private String doctorName; //담당의
    private Long reservationId;

    private Integer age;
    private BigDecimal currentWeight;
    private String diagnosis; //진단내용
    private String treatment;
    private boolean isSurgery;
    private boolean isHospitalized;
    private boolean isCheckedUp;

    public static MedicalRecordResponseDto from(MedicalRecord medicalRecord) {
        return MedicalRecordResponseDto.builder()
                .id(medicalRecord.getId())
                .doctorName(medicalRecord.getDoctor().getName())
                .currentWeight(medicalRecord.getCurrentWeight())
                .petName(medicalRecord.getPet().getName())
                .age(medicalRecord.getAge())
                .diagnosis(medicalRecord.getDiagnosis())
                .treatment(medicalRecord.getTreatment())
                .isSurgery(medicalRecord.getIsSurgery())
                .isHospitalized(medicalRecord.getIsHospitalized())
                .isCheckedUp(medicalRecord.getIsCheckedUp())
                .build();
    }

}
