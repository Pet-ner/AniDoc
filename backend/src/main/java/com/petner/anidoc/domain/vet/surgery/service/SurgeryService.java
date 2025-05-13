package com.petner.anidoc.domain.vet.surgery.service;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.medicalrecord.repository.MedicalRecordRepository;
import com.petner.anidoc.domain.vet.surgery.dto.SurgeryRequestDto;
import com.petner.anidoc.domain.vet.surgery.dto.SurgeryResponseDto;
import com.petner.anidoc.domain.vet.surgery.entity.Surgery;
import com.petner.anidoc.domain.vet.surgery.repository.SurgeryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;

@Service
@Slf4j
@RequiredArgsConstructor
public class SurgeryService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final SurgeryRepository surgeryRepository;

    @Transactional
    public SurgeryResponseDto createSurgery(SurgeryRequestDto surgeryRequestDto, Long userId, Long medicalRecordId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않습니다."));


        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("진료 기록을 작성할 권한이 없습니다.");
        }

        Surgery surgery = Surgery.builder()
                .medicalRecord(medicalRecord)
                .pet(medicalRecord.getPet()) // 이미 연관된 pet 사용 가능
                .surgeryName(surgeryRequestDto.getSurgeryName())
                .surgeryDate(surgeryRequestDto.getSurgeryDate())
                .anesthesiaType(surgeryRequestDto.getAnesthesiaType())
                .surgeryNote(surgeryRequestDto.getSurgeryNote())
                .build();

        Surgery savedSurgery = surgeryRepository.save(surgery);

        return SurgeryResponseDto.from(savedSurgery);
    }
}
