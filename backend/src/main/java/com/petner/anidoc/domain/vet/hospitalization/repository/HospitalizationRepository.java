package com.petner.anidoc.domain.vet.hospitalization.repository;

import com.petner.anidoc.domain.vet.hospitalization.entity.Hospitalization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HospitalizationRepository extends JpaRepository<Hospitalization,Long> {
}
