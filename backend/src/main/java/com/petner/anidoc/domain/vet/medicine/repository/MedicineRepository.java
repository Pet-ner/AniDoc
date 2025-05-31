package com.petner.anidoc.domain.vet.medicine.repository;

import com.petner.anidoc.domain.vet.medicine.entity.Medicine;
import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    // 특정 병원의 모든 약품 조회
    List<Medicine> findByVetInfoOrderByMedicationNameAsc(VetInfo vetInfo);

    // 특정 병원의 약품명으로 검색
    Optional<Medicine> findByVetInfoAndMedicationName(VetInfo vetInfo, String medicationName);

    // 특정 병원의 재고가 부족한 약품 조회
    @Query("SELECT m FROM Medicine m WHERE m.vetInfo = :vetInfo AND m.stock <= :minimum ORDER BY m.stock ASC")
    List<Medicine> findLowStockMedicines(@Param("vetInfo") VetInfo vetInfo, @Param("minimum") Integer minimum);

    // 특정 병원의 약품명으로 부분 검색
    @Query("SELECT m FROM Medicine m WHERE m.vetInfo = :vetInfo AND m.medicationName LIKE %:keyword% ORDER BY m.medicationName ASC")
    List<Medicine> findByVetInfoAndMedicationNameContaining(@Param("vetInfo") VetInfo vetInfo, @Param("keyword") String keyword);

    // 특정 병원의 재고가 있는 약품만 조회
    @Query("SELECT m FROM Medicine m WHERE m.vetInfo = :vetInfo AND m.stock > 0 ORDER BY m.medicationName ASC")
    List<Medicine> findAvailableMedicines(@Param("vetInfo") VetInfo vetInfo);
}