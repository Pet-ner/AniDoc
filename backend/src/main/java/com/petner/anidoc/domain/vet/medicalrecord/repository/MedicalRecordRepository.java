package com.petner.anidoc.domain.vet.medicalrecord.repository;

import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

//    @Query("SELECT m FROM MedicalRecord m WHERE m.id = :id AND m.isDeleted = false")
//    Optional<MedicalRecord> findByIdAndNotDeleted(@Param("id") Long id);

    Optional<MedicalRecord> findByIdAndIsDeletedFalse(Long id);

}
