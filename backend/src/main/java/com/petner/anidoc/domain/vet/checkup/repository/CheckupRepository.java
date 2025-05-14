package com.petner.anidoc.domain.vet.checkup.repository;

import com.petner.anidoc.domain.vet.checkup.entity.CheckupRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckupRepository extends JpaRepository<CheckupRecord, Long> {
}
