package com.petner.anidoc.domain.vet.medicalrecord.service;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.checkuprecord.dto.CheckupRecordRequestDto;
import com.petner.anidoc.domain.vet.checkuprecord.entity.CheckupRecord;
import com.petner.anidoc.domain.vet.checkuprecord.repository.CheckupRecordRepository;
import com.petner.anidoc.domain.vet.checkuprecord.service.CheckupRecordService;
import com.petner.anidoc.domain.vet.hospitalizationrecord.entity.HospitalizationRecord;
import com.petner.anidoc.domain.vet.hospitalizationrecord.repository.HospitalizationRecordRepository;
import com.petner.anidoc.domain.vet.hospitalizationrecord.service.HospitalizationRecordService;
import com.petner.anidoc.domain.vet.medicalrecord.dto.FullMedicalRecordUpdateDto;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.medicalrecord.repository.MedicalRecordRepository;
import com.petner.anidoc.domain.vet.surgeryrecord.entity.SurgeryRecord;
import com.petner.anidoc.domain.vet.surgeryrecord.repository.SurgeryRecordRepository;
import com.petner.anidoc.domain.vet.surgeryrecord.service.SurgeryRecordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor

public class FullMedicalRecordService {

    private final MedicalRecordService medicalRecordService;
    private final SurgeryRecordService surgeryRecordService;
    private final CheckupRecordService checkupRecordService;
    private final HospitalizationRecordService hospitalizationRecordService;
    private final UserRepository userRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final CheckupRecordRepository checkupRecordRepository;
    private final HospitalizationRecordRepository hospitalizationRecordRepository;
    private final SurgeryRecordRepository surgeryRecordRepository;

    @Transactional
    public void updateFullMedicalRecord(Long userId, Long medicalRecordId, FullMedicalRecordUpdateDto dto) throws AccessDeniedException {
        medicalRecordService.updateMedicalRecord(userId, medicalRecordId, dto.getMedicalRecord());

        if (dto.getSurgery() != null) {
            surgeryRecordService.updateSurgeryRecord(dto.getSurgery(), userId, medicalRecordId, dto.getSurgery().getId());
        }

        if (dto.getHospitalization() != null) {
            hospitalizationRecordService.updateHospitalizationRecord(dto.getHospitalization(), userId, medicalRecordId, dto.getHospitalization().getId());
        }

        if (dto.getCheckups() != null) {
            for (CheckupRecordRequestDto checkup : dto.getCheckups()) {
                checkupRecordService.updateCheckupRecord(checkup, userId, medicalRecordId, checkup.getId());
            }
        }
    }

    @Transactional
    public void deleteFullMedicalRecord(Long userId, Long medicalRecordId) throws AccessDeniedException {
        checkupRecordService.deleteAllByMedicalRecordId(userId, medicalRecordId);

        SurgeryRecord surgeryRecord = surgeryRecordRepository.findByMedicalRecordIdAndIsDeletedFalse(medicalRecordId)
                .orElse(null);
        if (surgeryRecord != null) {
            surgeryRecordService.deleteSurgeryRecord(userId, medicalRecordId, surgeryRecord.getId());
        }

        HospitalizationRecord hospitalizationRecord = hospitalizationRecordRepository.findByMedicalRecordIdAndIsDeletedFalse(medicalRecordId)
                .orElse(null);
        if (hospitalizationRecord != null) {
            hospitalizationRecordService.deleteHospitalizationRecord(userId, medicalRecordId, hospitalizationRecord.getId());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        if (!user.getRole().equals(UserRole.ROLE_STAFF)) {
            throw new AccessDeniedException("진료기록을 삭제할 권한이 없습니다.");
        }

        MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndIsDeletedFalse(medicalRecordId)
                .orElseThrow(() -> new IllegalArgumentException("해당 진료기록이 존재하지 않거나 삭제되었습니다."));

        medicalRecord.markAsDeleted();
    }



}
