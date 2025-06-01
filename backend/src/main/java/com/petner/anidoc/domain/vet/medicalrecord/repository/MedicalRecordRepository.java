package com.petner.anidoc.domain.vet.medicalrecord.repository;

import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    Optional<MedicalRecord> findByIdAndIsDeletedFalse(Long id);
    Optional<MedicalRecord> findByReservationIdAndIsDeletedFalse(Long reservationId);
    boolean existsByReservationId(Long reservationId);
    Optional<MedicalRecord> findByReservation_IdAndIsDeletedFalse(Long reservationId);
    @Query("SELECT m FROM MedicalRecord m JOIN FETCH m.pet WHERE m.reservation.id = :reservationId AND m.isDeleted = false")
    Optional<MedicalRecord> findWithPetByReservationId(@Param("reservationId") Long reservationId);

    @Query("""
    SELECT m FROM MedicalRecord m
    JOIN FETCH m.pet
    JOIN FETCH m.doctor
    JOIN FETCH m.reservation
    LEFT JOIN FETCH m.checkupResults
    LEFT JOIN FETCH m.hospitalizations
    LEFT JOIN FETCH m.surgeries
    WHERE m.reservation.id = :reservationId
    """)
    Optional<MedicalRecord> findWithAllDetailsByReservationId(@Param("reservationId") Long reservationId);


    @Query("""
    SELECT m FROM MedicalRecord m
    JOIN FETCH m.reservation r
    JOIN FETCH m.doctor
    JOIN FETCH m.pet
    WHERE r.user.id = :userId AND m.isDeleted = false
    """)
    List<MedicalRecord> findAllByReservation_UserIdAndIsDeletedFalse(@Param("userId") Long userId);

    @Query("""
    SELECT m FROM MedicalRecord m
    JOIN FETCH m.pet
    JOIN FETCH m.doctor
    JOIN FETCH m.reservation
    LEFT JOIN FETCH m.checkupResults
    LEFT JOIN FETCH m.hospitalizations
    LEFT JOIN FETCH m.surgeries
    WHERE m.id = :id AND m.isDeleted = false
    """)
    Optional<MedicalRecord> findByIdWithAllDetails(@Param("id") Long id);


    //대시보드 상단통계카드
    //추가(보호자)
    @Query("SELECT COUNT(mr) FROM MedicalRecord mr JOIN mr.pet p WHERE p.owner.id = :ownerId")
    int countTreatmentsByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT MAX(mr.createdAt) FROM MedicalRecord mr " +
        "WHERE mr.pet.owner.id = :ownerId")
    Optional<LocalDateTime> findLatestTreatmentDateByOwnerId(@Param("ownerId") Long ownerId);

    //추가(의료진, 관리자)
    //특정 기간 내 완료된 진료 수
    int countByIsDeletedFalseAndCreatedAtBetween(
            LocalDateTime startDate,
            LocalDateTime endDate
    );
    // 특정 의료진의 기간별 진료 수
    @Query("SELECT COUNT(DISTINCT m.pet.id) FROM MedicalRecord m WHERE m.doctor.id = :doctorId AND m.isDeleted = false")
    int countDistinctPetsByDoctorId(@Param("doctorId") Long doctorId);
    @Query("SELECT COUNT(m) FROM MedicalRecord m WHERE m.doctor.id = :doctorId " +
            "AND m.isDeleted = false AND m.createdAt BETWEEN :startDate AND :endDate")
    int countByDoctorIdAndIsDeletedFalseAndCreatedAtBetween(
            @Param("doctorId") Long doctorId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );







}
