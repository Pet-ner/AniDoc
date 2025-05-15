package com.petner.anidoc.domain.vet.checkup.repository;

import com.petner.anidoc.domain.vet.checkup.entity.CheckupRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CheckupRepository extends JpaRepository<CheckupRecord, Long> {
    List<CheckupRecord> findAllByMedicalRecordId(Long medicalRecordId);
    Optional<>
}
