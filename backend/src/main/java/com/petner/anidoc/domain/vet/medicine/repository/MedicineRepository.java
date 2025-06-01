package com.petner.anidoc.domain.vet.medicine.repository;

import com.petner.anidoc.domain.vet.medicine.entity.Medicine;
import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    // 특정 병원의 모든 약품 조회
    List<Medicine> findByVetInfoOrderByMedicationNameAsc(VetInfo vetInfo);

    // 특정 병원의 약품명으로 검색
    Optional<Medicine> findByVetInfoAndMedicationName(VetInfo vetInfo, String medicationName);

}