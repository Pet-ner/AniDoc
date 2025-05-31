package com.petner.anidoc.domain.vet.medicalrecord.dto;

import com.petner.anidoc.domain.vet.checkuprecord.dto.CheckupRecordRequestDto;
import com.petner.anidoc.domain.vet.hospitalizationrecord.dto.HospitalizationRecordRequestDto;
import com.petner.anidoc.domain.vet.surgeryrecord.dto.SurgeryRecordRequestDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class FullMedicalRecordUpdateDto { //진료기록에 따른 입원, 수술, 삭제 전부 컨트롤 하기 위함
    private MedicalRecordRequestDto medicalRecord;
    private SurgeryRecordRequestDto surgery;
    private HospitalizationRecordRequestDto hospitalization;
    private List<CheckupRecordRequestDto> checkups;
}
