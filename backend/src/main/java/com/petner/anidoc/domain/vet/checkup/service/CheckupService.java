package com.petner.anidoc.domain.vet.checkup.service;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.checkup.dto.CheckupRequestDto;
import com.petner.anidoc.domain.vet.checkup.dto.CheckupResponseDto;
import com.petner.anidoc.domain.vet.checkup.entity.CheckupResult;
import com.petner.anidoc.domain.vet.checkup.entity.CheckupStatus;
import com.petner.anidoc.domain.vet.checkup.entity.CheckupType;
import com.petner.anidoc.domain.vet.checkup.repository.CheckupRepository;
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
public class CheckupService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final CheckupRepository checkupRepository;

    @Transactional
    public CheckupResponseDto createCheckup(CheckupRequestDto checkupRequestDto, Long userId, Long medicalRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않습니다."));


        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("진료 기록을 작성할 권한이 없습니다.");
        }

        CheckupResult checkupResult = CheckupResult.builder()
                .medicalRecord(medicalRecord)
                .checkupType(checkupRequestDto.getCheckupType())
                .result(checkupRequestDto.getResult())
                .resultUrl(checkupRequestDto.getResultUrl())
                .checkupDate(checkupRequestDto.getCheckupDate())
                .status(checkupRequestDto.getStatus())
                .build();

        CheckupResult savedResult = checkupRepository.save(checkupResult);

        return CheckupResponseDto.from(savedResult);
    }

}
