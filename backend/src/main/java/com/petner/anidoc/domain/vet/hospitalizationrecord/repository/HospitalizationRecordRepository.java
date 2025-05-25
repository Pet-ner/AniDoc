package com.petner.anidoc.domain.vet.hospitalizationrecord.repository;

import com.petner.anidoc.domain.vet.hospitalizationrecord.entity.HospitalizationRecord;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.Optional;

@Repository
public interface HospitalizationRecordRepository extends JpaRepository<HospitalizationRecord,Long> {

    boolean existsByMedicalRecord(MedicalRecord medicalRecord);

    Optional<HospitalizationRecord> findByMedicalRecordAndIsDeletedFalse(MedicalRecord medicalRecord);

    Optional<HospitalizationRecord> findByIdAndIsDeletedFalse(Long id);
}
