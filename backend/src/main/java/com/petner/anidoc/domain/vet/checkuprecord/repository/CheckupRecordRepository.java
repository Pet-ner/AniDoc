package com.petner.anidoc.domain.vet.checkuprecord.repository;

import com.petner.anidoc.domain.vet.checkuprecord.entity.CheckupRecord;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CheckupRecordRepository extends JpaRepository<CheckupRecord, Long> {
    Optional<CheckupRecord> findByIdAndIsDeletedFalse(Long id);
    List<CheckupRecord> findAllByMedicalRecordId(Long medicalRecordId);
    boolean existsByMedicalRecordAndIsDeletedFalse(MedicalRecord medicalRecord);

}
