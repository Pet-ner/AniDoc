package com.petner.anidoc.domain.vet.reservation.dto;

import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import com.petner.anidoc.domain.vet.reservation.entity.ReservationStatus;
import com.petner.anidoc.domain.vet.reservation.entity.ReservationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReservationResponseDto {
    private Long id;
    private Long userId;
    private String userName;
    private Long petId;
    private String petName;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private ReservationStatus status;
    private String symptom;
    private ReservationType type;
    private String createdAt;
    private String updatedAt;

    // 엔티티 -> DTO 변환
    public static ReservationResponseDto fromEntity(Reservation reservation) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return ReservationResponseDto.builder()
                .id(reservation.getId())
                .userId(reservation.getUser().getId())
                .userName(reservation.getUser().getName())
                .petId(reservation.getPet().getId())
                .petName(reservation.getPet().getName())
                .reservationDate(reservation.getReservationDate())
                .reservationTime(reservation.getReservationTime())
                .status(reservation.getStatus())
                .symptom(reservation.getSymptom())
                .type(reservation.getType())
                .createdAt(reservation.getCreatedAt().format(formatter))
                .updatedAt(reservation.getUpdatedAt().format(formatter))
                .build();
    }
}
