package com.petner.anidoc.domain.user.notification.dto;

import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationNotificationDto {

    private Long reservationId;
    private String userName;
    private String petName;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private String status;
    private LocalDateTime createdAt; // 알림 생성일시
    private Boolean isRead;
    private String content;

    public static ReservationNotificationDto from(Reservation reservation) {

        return ReservationNotificationDto.builder()
                .reservationId(reservation.getId())
                .userName(reservation.getUser().getName())
                .petName(reservation.getPet().getName())
                .reservationDate(reservation.getReservationDate())
                .reservationTime(reservation.getReservationTime())
                .status(reservation.getStatus().name())
                .createdAt(reservation.getCreatedAt())
                .isRead(false)
                .build();

    }

}
