package com.petner.anidoc.domain.vet.medicalrecord.dto;

import com.petner.anidoc.domain.vet.checkuprecord.dto.CheckupRecordResponseDto;
import com.petner.anidoc.domain.vet.hospitalizationrecord.dto.HospitalizationRecordResponseDto;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.surgeryrecord.dto.SurgeryRecordResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

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
    private boolean isDeleted;
    private SurgeryRecordResponseDto surgery;
    private HospitalizationRecordResponseDto hospitalization;
    private List<CheckupRecordResponseDto> checkups;
    private String reservationDate;
    private String reservationTime;
    private String symptom;
    private Long userId;



    public static MedicalRecordResponseDto from(
            MedicalRecord medicalRecord,
            SurgeryRecordResponseDto surgeryDto,
            HospitalizationRecordResponseDto hospitalizationDto,
            List<CheckupRecordResponseDto> checkupDtos
    ) {
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
                .isDeleted(medicalRecord.getIsDeleted())
                .surgery(surgeryDto)
                .hospitalization(hospitalizationDto)
                .checkups(checkupDtos)
                .reservationId(medicalRecord.getReservation().getId())
                .reservationDate(medicalRecord.getReservation().getReservationDate().toString())
                .reservationTime(medicalRecord.getReservation().getReservationTime().toString())
                .symptom(medicalRecord.getReservation().getSymptom())
                .userId(medicalRecord.getReservation().getUser().getId())
                .build();
    }

    // ✅ 새로 추가: 파라미터 1개짜리 (기존 서비스에서 사용되던 용도)
    public static MedicalRecordResponseDto from(MedicalRecord medicalRecord) {
        return from(medicalRecord, null, null, null); // 수술/입원/검사 없음으로 간주
    }


}
