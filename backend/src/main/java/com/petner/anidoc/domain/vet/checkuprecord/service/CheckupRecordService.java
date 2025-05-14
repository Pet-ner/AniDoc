package com.petner.anidoc.domain.vet.checkuprecord.service;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.checkuprecord.dto.CheckupRecordRequestDto;
import com.petner.anidoc.domain.vet.checkuprecord.dto.CheckupRecordResponseDto;
import com.petner.anidoc.domain.vet.checkuprecord.entity.CheckupRecord;
import com.petner.anidoc.domain.vet.checkuprecord.repository.CheckupRecordRepository;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.medicalrecord.repository.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;

@Service
@Slf4j
@RequiredArgsConstructor
public class CheckupRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final CheckupRecordRepository checkupRecordRepository;

    @Transactional
    public CheckupRecordResponseDto createCheckupRecord(CheckupRecordRequestDto checkupRecordRequestDto, Long userId, Long medicalRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않습니다."));


        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("진료 기록을 작성할 권한이 없습니다.");
        }

        CheckupRecord checkupRecord = CheckupRecord.builder()
                .medicalRecord(medicalRecord)
                .checkupType(checkupRecordRequestDto.getCheckupType())
                .result(checkupRecordRequestDto.getResult())
                .resultUrl(checkupRecordRequestDto.getResultUrl())
                .checkupDate(checkupRecordRequestDto.getCheckupDate())
                .status(checkupRecordRequestDto.getStatus())
                .build();

        CheckupRecord savedResult = checkupRecordRepository.save(checkupRecord);

        return CheckupRecordResponseDto.from(savedResult);
    }

}
