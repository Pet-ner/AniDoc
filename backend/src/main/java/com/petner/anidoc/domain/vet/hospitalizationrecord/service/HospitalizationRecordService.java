package com.petner.anidoc.domain.vet.hospitalizationrecord.service;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.hospitalizationrecord.dto.HospitalizationRecordRequestDto;
import com.petner.anidoc.domain.vet.hospitalizationrecord.dto.HospitalizationRecordResponseDto;
import com.petner.anidoc.domain.vet.hospitalizationrecord.entity.HospitalizationRecord;
import com.petner.anidoc.domain.vet.hospitalizationrecord.repository.HospitalizationRecordRepository;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.medicalrecord.repository.MedicalRecordRepository;
import com.petner.anidoc.domain.vet.surgeryrecord.dto.SurgeryRecordRequestDto;
import com.petner.anidoc.domain.vet.surgeryrecord.dto.SurgeryRecordResponseDto;
import com.petner.anidoc.domain.vet.surgeryrecord.entity.SurgeryRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;

@Service
@Slf4j
@RequiredArgsConstructor
public class HospitalizationRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final HospitalizationRecordRepository hospitalizationRecordRepository;

    @Transactional
    public HospitalizationRecordResponseDto createHospitalizationRecord(HospitalizationRecordRequestDto hospitalizationRecordRequestDto, Long userId, Long medicalRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않습니다."));


        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("진료 기록을 작성할 권한이 없습니다.");
        }

        if(hospitalizationRecordRepository.existsByMedicalRecord(medicalRecord)){
            throw new IllegalArgumentException("이미 해당 진료기록에 입원기록이 존재합니다.");
        }

        medicalRecord.setIsHospitalized(true);

        HospitalizationRecord hospitalizationRecord = HospitalizationRecord.builder()
                .medicalRecord(medicalRecord)
                .pet(medicalRecord.getPet())
                .admissionDate(hospitalizationRecordRequestDto.getAdmissionDate())
                .dischargeDate(hospitalizationRecordRequestDto.getDischargeDate())
                .reason(hospitalizationRecordRequestDto.getReason())
                .imageUrl(hospitalizationRecordRequestDto.getImageUrl())
                .build();

        HospitalizationRecord saved = hospitalizationRecordRepository.save(hospitalizationRecord);

        return HospitalizationRecordResponseDto.from(saved);
    }

    @Transactional
    public HospitalizationRecordResponseDto getHospitalizationRecord(Long userId, Long medicalRecordId){
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않습니다."));

        HospitalizationRecord hospitalizationRecord = hospitalizationRecordRepository.findByMedicalRecordAndIsDeletedFalse(medicalRecord)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록에 입원 기록이 존재하지 않거나 이미 삭제되었습니다."));

        return HospitalizationRecordResponseDto.from(hospitalizationRecord);
    }

    @Transactional
    public void deleteHospitalizationRecord(Long userId, Long medicalRecordId, Long hospitalizationRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndIsDeletedFalse(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않거나 이미 삭제되었습니다."));


        HospitalizationRecord hospitalizationRecord = hospitalizationRecordRepository.findByIdAndIsDeletedFalse(hospitalizationRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 입원 기록이 존재하지 않거나 이미 삭제되었습니다."));

        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("입원 기록을 삭제할 권한이 없습니다.");
        }

        medicalRecord.setIsHospitalized(false);
        hospitalizationRecord.markAsDeleted();
    }


    @Transactional
    public HospitalizationRecordResponseDto updateHospitalizationRecord(HospitalizationRecordRequestDto hospitalizationRecordRequestDto, Long userId, Long medicalRecordId, Long hospitalizationRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndIsDeletedFalse(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않거나 이미 삭제되었습니다."));


        HospitalizationRecord hospitalizationRecord = hospitalizationRecordRepository.findByIdAndIsDeletedFalse(hospitalizationRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 입원 기록이 존재하지 않거나 이미 삭제되었습니다."));

        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("입원 기록을 수정할 권한이 없습니다.");
        }

        hospitalizationRecord.updateFromDto(hospitalizationRecordRequestDto);
        return HospitalizationRecordResponseDto.from(hospitalizationRecord);
    }


}
