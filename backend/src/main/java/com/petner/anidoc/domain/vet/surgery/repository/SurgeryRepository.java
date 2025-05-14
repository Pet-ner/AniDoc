package com.petner.anidoc.domain.vet.surgery.repository;

import com.petner.anidoc.domain.vet.surgery.entity.SurgeryRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SurgeryRepository extends JpaRepository<SurgeryRecord, Long> {
}
