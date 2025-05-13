package com.petner.anidoc.domain.vet.reservation.repository;

import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
}
