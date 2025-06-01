package com.petner.anidoc.domain.vet.vaccination.repository;

import com.petner.anidoc.domain.vet.vaccination.entity.Vaccination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Long>{
    List<Vaccination> findByPetOwnerId(Long ownerId);
    // 의료진별 기간별 예방접종 건수 조회
    int countByDoctorIdAndCreatedAtBetween(Long doctorId, LocalDateTime start, LocalDateTime end);

    // 전체 기간별 예방접종 건수 조회 (관리자용)
    int countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    Optional<Vaccination> findByReservationId(Long reservationId);
}
