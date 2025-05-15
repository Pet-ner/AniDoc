package com.petner.anidoc.domain.vet.surgeryrecord.repository;

import com.petner.anidoc.domain.vet.checkuprecord.entity.CheckupRecord;
import com.petner.anidoc.domain.vet.surgeryrecord.entity.SurgeryRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SurgeryRecordRepository extends JpaRepository<SurgeryRecord, Long> {
    Optional<SurgeryRecord> findByIdAndIsDeletedFalse(Long id);

    List<SurgeryRecord> findAllByMedicalRecordId(Long medicalRecordId);
}
