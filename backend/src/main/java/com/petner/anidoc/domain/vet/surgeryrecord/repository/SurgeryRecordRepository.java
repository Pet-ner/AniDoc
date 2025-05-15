package com.petner.anidoc.domain.vet.surgeryrecord.repository;

import com.petner.anidoc.domain.vet.surgeryrecord.entity.SurgeryRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SurgeryRecordRepository extends JpaRepository<SurgeryRecord, Long> {
}
