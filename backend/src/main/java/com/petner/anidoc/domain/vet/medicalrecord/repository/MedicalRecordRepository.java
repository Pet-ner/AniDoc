package com.petner.anidoc.domain.vet.medicalrecord.repository;

import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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









}
