package com.petner.anidoc.domain.vet.prescription.repository;

import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.medicine.entity.Medicine;
import com.petner.anidoc.domain.vet.prescription.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    // 특정 진료 기록의 모든 처방전 조회
    List<Prescription> findByMedicalRecordOrderByCreatedAtAsc(MedicalRecord medicalRecord);

    // 특정 약품의 처방 내역 조회
    List<Prescription> findByMedicineOrderByCreatedAtDesc(Medicine medicine);
}