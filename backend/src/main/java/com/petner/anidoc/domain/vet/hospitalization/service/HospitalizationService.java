package com.petner.anidoc.domain.vet.hospitalization.service;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.hospitalization.dto.HospitalizationRequestDto;
import com.petner.anidoc.domain.vet.hospitalization.dto.HospitalizationResponseDto;
import com.petner.anidoc.domain.vet.hospitalization.entity.Hospitalization;
import com.petner.anidoc.domain.vet.hospitalization.repository.HospitalizationRepository;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.medicalrecord.repository.MedicalRecordRepository;
import com.petner.anidoc.domain.vet.surgery.repository.SurgeryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;

@Service
@Slf4j
@RequiredArgsConstructor
public class HospitalizationService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final HospitalizationRepository hospitalizationRepository;

    @Transactional
    public HospitalizationResponseDto createHospitalization(HospitalizationRequestDto hospitalizationRequestDto, Long userId, Long medicalRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않습니다."));


        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("진료 기록을 작성할 권한이 없습니다.");
        }

        Hospitalization hospitalization = Hospitalization.builder()
                .medicalRecord(medicalRecord)
                .pet(medicalRecord.getPet())
                .admissionDate(hospitalizationRequestDto.getAdmissionDate())
                .dischargeDate(hospitalizationRequestDto.getDischargeDate())
                .reason(hospitalizationRequestDto.getReason())
                .imageUrl(hospitalizationRequestDto.getImageUrl())
                .build();

        Hospitalization saved = hospitalizationRepository.save(hospitalization);

        return HospitalizationResponseDto.from(saved);


    }


}
