package com.petner.anidoc.domain.user.pet.repository;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwnerId(Long ownerId);
    List<Pet> findByIsDeceasedFalse();

    // 보호자 정보와 진료 기록, 예약 정보를 함께 조회
    @Query("SELECT p FROM Pet p " +
            "LEFT JOIN FETCH p.owner " +
            "LEFT JOIN FETCH p.medicalRecords mr " +
            "LEFT JOIN FETCH mr.reservation " +
            "WHERE p.id = :petId")
    Optional<Pet> findByIdWithOwnerAndMedicalRecords(@Param("petId") Long petId);

    // 모든 반려동물을 보호자 정보와 진료 기록과 함께 조회
    @Query("SELECT DISTINCT p FROM Pet p " +
            "LEFT JOIN FETCH p.owner " +
            "LEFT JOIN FETCH p.medicalRecords mr " +
            "LEFT JOIN FETCH mr.reservation")
    List<Pet> findAllWithOwnersAndMedicalRecords();

    //fetch Join - 예약 성능 개선
    @Query("SELECT p FROM Pet p LEFT JOIN FETCH p.owner WHERE p.owner.id = :ownerId")
    List<Pet> findByOwnerIdWithDetails(@Param("ownerId") Long ownerId);


}
