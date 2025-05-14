package com.petner.anidoc.domain.vet.surgeryrecord.service;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
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
            throw new AccessDeniedException("진료 기록을 작성할 권한이 없습니다.");
        }

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
}
