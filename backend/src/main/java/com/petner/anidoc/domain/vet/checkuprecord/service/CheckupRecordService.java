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
import java.util.List;
import java.util.stream.Collectors;

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

        medicalRecord.setIsCheckedUp(true);

        CheckupRecord checkupRecord = CheckupRecord.builder()
                .medicalRecord(medicalRecord)
                .checkupType(checkupRecordRequestDto.getCheckupType())
                .result(checkupRecordRequestDto.getResult())
                .resultUrl(checkupRecordRequestDto.getResultUrl())
                .checkupDate(checkupRecordRequestDto.getCheckupDate())
                .build();

        CheckupRecord savedResult = checkupRecordRepository.save(checkupRecord);

        return CheckupRecordResponseDto.from(savedResult);
    }

    @Transactional
    public List<CheckupRecordResponseDto> getCheckupRecord(Long userId, Long medicalRecordId){ //진료기록 기준 모든 검사기록 조회
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않습니다."));

        List<CheckupRecord> checkupRecords = checkupRecordRepository.findAllByMedicalRecordId(medicalRecordId);

        return checkupRecords.stream()
                .map(CheckupRecordResponseDto::from)
                .collect(Collectors.toList());

    }

    @Transactional
    public void deleteCheckupRecord(Long userId, Long medicalRecordId, Long checkupRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndIsDeletedFalse(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않거나 이미 삭제되었습니다."));


        CheckupRecord checkupRecord = checkupRecordRepository.findById(checkupRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 검사 기록이 존재하지 않습니다."));

        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("검사 기록을 삭제할 권한이 없습니다.");
        }

        if (!checkupRecordRepository.existsByMedicalRecordAndIsDeletedFalse(medicalRecord)) {
            medicalRecord.setIsCheckedUp(false);
        }

        checkupRecord.markAsDeleted();
    }

    @Transactional
    public CheckupRecordResponseDto updateCheckupRecord(CheckupRecordRequestDto checkupRequestDto,Long userId, Long medicalRecordId, Long checkupRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndIsDeletedFalse(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않거나 이미 삭제되었습니다."));


        CheckupRecord checkupRecord = checkupRecordRepository.findByIdAndIsDeletedFalse(checkupRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 검사 기록이 존재하지 않거나 이미 삭제되었습니다."));

        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("검사 기록을 수정할 권한이 없습니다.");
        }

        checkupRecord.updateFromDto(checkupRequestDto);
        return CheckupRecordResponseDto.from(checkupRecord);
    }

    @Transactional
    public void deleteAllByMedicalRecordId(Long userId, Long medicalRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        if (!user.getRole().equals(UserRole.ROLE_STAFF)) {
            throw new AccessDeniedException("검사 기록을 삭제할 권한이 없습니다.");
        }

        MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndIsDeletedFalse(medicalRecordId)
                .orElseThrow(() -> new IllegalArgumentException("해당 진료기록이 존재하지 않거나 삭제되었습니다."));

        List<CheckupRecord> checkupRecords = checkupRecordRepository.findAllByMedicalRecordIdAndIsDeletedFalse(medicalRecordId);

        for (CheckupRecord record : checkupRecords) {
            record.markAsDeleted();
        }

        if (!checkupRecords.isEmpty()) {
            medicalRecord.setIsCheckedUp(false);
        }
    }



}
