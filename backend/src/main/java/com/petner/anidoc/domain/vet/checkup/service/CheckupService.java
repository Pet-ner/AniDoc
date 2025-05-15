package com.petner.anidoc.domain.vet.checkup.service;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.checkup.dto.CheckupRequestDto;
import com.petner.anidoc.domain.vet.checkup.dto.CheckupResponseDto;
import com.petner.anidoc.domain.vet.checkup.entity.CheckupRecord;
import com.petner.anidoc.domain.vet.checkup.repository.CheckupRepository;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.medicalrecord.repository.MedicalRecordRepository;
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
public class CheckupService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final CheckupRepository checkupRepository;

    @Transactional
    public CheckupResponseDto createCheckupRecord(CheckupRequestDto checkupRequestDto, Long userId, Long medicalRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않습니다."));


        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("진료 기록을 작성할 권한이 없습니다.");
        }

        CheckupRecord checkupResult = CheckupRecord.builder()
                .medicalRecord(medicalRecord)
                .checkupType(checkupRequestDto.getCheckupType())
                .result(checkupRequestDto.getResult())
                .resultUrl(checkupRequestDto.getResultUrl())
                .checkupDate(checkupRequestDto.getCheckupDate())
                .status(checkupRequestDto.getStatus())
                .build();

        CheckupRecord savedResult = checkupRepository.save(checkupResult);

        return CheckupResponseDto.from(savedResult);
    }

    @Transactional
    public List<CheckupResponseDto> getCheckupRecord(Long userId, Long medicalRecordId){ //진료기록 기준 모든 검사기록 조회
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않습니다."));

        List<CheckupRecord> checkupRecords = checkupRepository.findAllByMedicalRecordId(medicalRecordId);

        return checkupRecords.stream()
                .map(CheckupResponseDto::from)
                .collect(Collectors.toList());

    }

    @Transactional
    public void deleteCheckupRecord(Long userId, Long medicalRecordId, Long checkupRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndIsDeletedFalse(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않거나 이미 삭제되었습니다."));


        CheckupRecord checkupRecord = checkupRepository.findById(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 검사 기록이 존재하지 않습니다."));

        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("검사 기록을 삭제할 권한이 없습니다.");
        }

        checkupRecord.markAsDeleted();
    }

    @Transactional
    public CheckupResponseDto updateCheckupRecord(Long userId, Long medicalRecordId, Long checkupRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndIsDeletedFalse(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않거나 이미 삭제되었습니다."));


        CheckupRecord checkupRecord = checkupRepository.findById(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 검사 기록이 존재하지 않습니다."));

        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("검사 기록을 삭제할 권한이 없습니다.");
        }
    }

}
