package com.petner.anidoc.domain.vet.vet.repository;

import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VetInfoRepository extends JpaRepository<VetInfo, Long> {
}