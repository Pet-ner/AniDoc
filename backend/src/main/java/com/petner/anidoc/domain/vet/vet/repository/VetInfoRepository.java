package com.petner.anidoc.domain.vet.vet.repository;

import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VetInfoRepository extends JpaRepository<VetInfo, Long> {
}