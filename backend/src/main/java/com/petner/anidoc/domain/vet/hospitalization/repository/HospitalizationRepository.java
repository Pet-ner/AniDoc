package com.petner.anidoc.domain.vet.hospitalization.repository;

import com.petner.anidoc.domain.vet.hospitalization.entity.HospitalizationRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HospitalizationRepository extends JpaRepository<HospitalizationRecord,Long> {
}
