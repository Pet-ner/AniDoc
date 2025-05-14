package com.petner.anidoc.domain.vet.hospitalizationrecord.repository;

import com.petner.anidoc.domain.vet.hospitalizationrecord.entity.HospitalizationRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HospitalizationRecordRepository extends JpaRepository<HospitalizationRecord,Long> {
}
