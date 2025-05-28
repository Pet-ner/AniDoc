package com.petner.anidoc.domain.vet.surgeryrecord.repository;

import com.petner.anidoc.domain.vet.checkuprecord.entity.CheckupRecord;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.surgeryrecord.entity.SurgeryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SurgeryRecordRepository extends JpaRepository<SurgeryRecord, Long> {
    Optional<SurgeryRecord> findByIdAndIsDeletedFalse(Long id);

    Optional<SurgeryRecord> findByMedicalRecordAndIsDeletedFalse(MedicalRecord medicalRecord);

    boolean existsByMedicalRecord(MedicalRecord medicalRecord);

    Optional<SurgeryRecord> findByMedicalRecordId(Long medicalRecordId);

}
