package com.petner.anidoc.domain.vet.vaccination.repository;

import com.petner.anidoc.domain.vet.vaccination.entity.Vaccination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Long>{
    List<Vaccination> findByPetOwnerId(Long ownerId);
    Optional<Vaccination> findByReservationId(Long reservationId);
}
