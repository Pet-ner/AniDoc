package com.petner.anidoc.domain.vet.checkup.repository;

import com.petner.anidoc.domain.vet.checkup.entity.CheckupResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckupRepository extends JpaRepository<CheckupResult, Long> {
}
