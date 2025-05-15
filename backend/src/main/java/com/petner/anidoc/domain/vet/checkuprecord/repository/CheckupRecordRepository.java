package com.petner.anidoc.domain.vet.checkuprecord.repository;

import com.petner.anidoc.domain.vet.checkuprecord.entity.CheckupRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckupRecordRepository extends JpaRepository<CheckupRecord, Long> {
}
