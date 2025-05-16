package com.petner.anidoc.domain.vet.surgeryrecord.service;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.checkuprecord.dto.CheckupRecordRequestDto;
import com.petner.anidoc.domain.vet.checkuprecord.dto.CheckupRecordResponseDto;
import com.petner.anidoc.domain.vet.checkuprecord.entity.CheckupRecord;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.medicalrecord.repository.MedicalRecordRepository;
import com.petner.anidoc.domain.vet.surgeryrecord.dto.SurgeryRecordRequestDto;
import com.petner.anidoc.domain.vet.surgeryrecord.dto.SurgeryRecordResponseDto;
import com.petner.anidoc.domain.vet.surgeryrecord.entity.SurgeryRecord;
import com.petner.anidoc.domain.vet.surgeryrecord.repository.SurgeryRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class SurgeryRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final SurgeryRecordRepository surgeryRecordRepository;

    @Transactional
    public SurgeryRecordResponseDto createSurgeryRecord(SurgeryRecordRequestDto surgeryRecordRequestDto, Long userId, Long medicalRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않습니다."));


        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("수술 기록을 작성할 권한이 없습니다.");
        }

        if (surgeryRecordRepository.existsByMedicalRecord(medicalRecord)) {
            throw new IllegalStateException("이미 해당 진료기록에 수술기록이 존재합니다.");
        }

        medicalRecord.setIsSurgery(true);

        SurgeryRecord surgery = SurgeryRecord.builder()
                .medicalRecord(medicalRecord)
                .pet(medicalRecord.getPet()) // 이미 연관된 pet 사용 가능
                .surgeryName(surgeryRecordRequestDto.getSurgeryName())
                .surgeryDate(surgeryRecordRequestDto.getSurgeryDate())
                .anesthesiaType(surgeryRecordRequestDto.getAnesthesiaType())
                .surgeryNote(surgeryRecordRequestDto.getSurgeryNote())
                .build();

        SurgeryRecord savedSurgeryRecord = surgeryRecordRepository.save(surgery);

        return SurgeryRecordResponseDto.from(savedSurgeryRecord);
    }

    @Transactional
    public SurgeryRecordResponseDto getSurgeryRecord(Long userId, Long medicalRecordId){ //진료기록 기준 모든 수술기록 조회
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않습니다."));

        SurgeryRecord surgeryRecord = surgeryRecordRepository.findByMedicalRecordAndIsDeletedFalse(medicalRecord)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록에 수술 기록이 존재하지 않거나 이미삭제되었습니다."));

        return SurgeryRecordResponseDto.from(surgeryRecord);

    }

    @Transactional
    public void deleteSurgeryRecord(Long userId, Long medicalRecordId, Long surgeryRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndIsDeletedFalse(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않거나 이미 삭제되었습니다."));


        SurgeryRecord surgeryRecord = surgeryRecordRepository.findByIdAndIsDeletedFalse(surgeryRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 수술 기록이 존재하지 않거나 이미 삭제되었습니다."));

        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("수술 기록을 삭제할 권한이 없습니다.");
        }

        medicalRecord.setIsSurgery(false);
        surgeryRecord.markAsDeleted();
    }

    @Transactional
    public SurgeryRecordResponseDto updateSurgeryRecord(SurgeryRecordRequestDto surgeryRequestDto, Long userId, Long medicalRecordId, Long surgeryRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndIsDeletedFalse(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않거나 이미 삭제되었습니다."));


        SurgeryRecord surgeryRecord = surgeryRecordRepository.findByIdAndIsDeletedFalse(surgeryRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 수술 기록이 존재하지 않거나 이미 삭제되었습니다."));

        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("수술 기록을 수정할 권한이 없습니다.");
        }

        surgeryRecord.updateFromDto(surgeryRequestDto);
        return SurgeryRecordResponseDto.from(surgeryRecord);
    }
}
