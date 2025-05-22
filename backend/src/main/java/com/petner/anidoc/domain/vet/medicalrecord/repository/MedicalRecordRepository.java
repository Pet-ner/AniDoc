package com.petner.anidoc.domain.vet.medicalrecord.repository;

import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    Optional<MedicalRecord> findByIdAndIsDeletedFalse(Long id);
    Optional<MedicalRecord> findByReservationIdAndIsDeletedFalse(Long reservationId);


}
