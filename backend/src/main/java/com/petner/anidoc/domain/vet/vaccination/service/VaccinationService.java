package com.petner.anidoc.domain.vet.vaccination.service;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.pet.repository.PetRepository;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import com.petner.anidoc.domain.vet.reservation.entity.ReservationType;
import com.petner.anidoc.domain.vet.reservation.repository.ReservationRepository;
import com.petner.anidoc.domain.vet.vaccination.dto.VaccinationRequestDto;
import com.petner.anidoc.domain.vet.vaccination.dto.VaccinationResponseDto;
import com.petner.anidoc.domain.vet.vaccination.entity.Vaccination;
import com.petner.anidoc.domain.vet.vaccination.repository.VaccinationRepository;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.file.AccessDeniedException;

@Service
@Slf4j
@RequiredArgsConstructor
public class VaccinationService {
    private final VaccinationRepository vaccinationRepository;
    private final PetRepository petRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    @Transactional
    public VaccinationResponseDto createVaccination(
            VaccinationRequestDto vaccinationRequestDto,
            Long userId,
            Long reservationId) throws AccessDeniedException {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        if (!user.getRole().equals(UserRole.ROLE_STAFF)) {
            throw new AccessDeniedException("백신 기록을 작성할 권한이 없습니다.");
        }

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("해당 예약 건이 존재하지 않습니다."));

        if (!ReservationType.VACCINATION.equals(reservation.getType())) {
            throw new IllegalArgumentException("해당 예약은 백신 예약이 아닙니다.");
        }

        vaccinationRepository.findByReservationId(reservationId)
                .ifPresent(v -> {
                    throw new IllegalStateException("이미 해당 예약에 대한 백신 기록이 존재합니다.");
                });

        Vaccination vaccination = Vaccination.builder()
                .doctor(user)
                .pet(reservation.getPet())
                .reservation(reservation)
                .vaccineName(vaccinationRequestDto.getVaccineName())
                .currentDose(vaccinationRequestDto.getCurrentDose())
                .totalDoses(vaccinationRequestDto.getTotalDoses())
                .vaccinationDate(vaccinationRequestDto.getVaccinationDate())
                .status(vaccinationRequestDto.getStatus())
                .notes(vaccinationRequestDto.getNotes())
                .build();

        Vaccination savedVaccination = vaccinationRepository.save(vaccination);

        return VaccinationResponseDto.from(savedVaccination);
    }








}
