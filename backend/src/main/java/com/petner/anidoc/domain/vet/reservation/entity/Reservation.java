package com.petner.anidoc.domain.vet.reservation.entity;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.vet.reservation.dto.ReservationStatusUpdateRequestDto;
import com.petner.anidoc.domain.vet.reservation.dto.ReservationUpdateRequestDto;
import com.petner.anidoc.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
@Table(name = "reservations")
public class Reservation extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    @Column(name = "reservation_time", nullable = false)
    private LocalTime reservationTime;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;

    private String symptom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationType type;

    // 예약 시간 슬롯
    public static final List<LocalTime> RESERVATION_TIMES = Arrays.asList(
            LocalTime.of(9, 0), LocalTime.of(9, 30),
            LocalTime.of(10, 0), LocalTime.of(10, 30),
            LocalTime.of(11, 0), LocalTime.of(11, 30),
            LocalTime.of(13, 0), LocalTime.of(13, 30),
            LocalTime.of(14, 0), LocalTime.of(14, 30),
            LocalTime.of(15, 0), LocalTime.of(15, 30),
            LocalTime.of(16, 0), LocalTime.of(16, 30),
            LocalTime.of(17, 0), LocalTime.of(17, 30)
    );

    // 입력된 시간이 유효한 예약 시간인지 확인
    public static boolean isValidReservationTime(LocalTime time) {
        return RESERVATION_TIMES.contains(time);
    }

    public void updateReservationFromDto(ReservationUpdateRequestDto dto) {
        this.reservationDate = dto.getReservationDate();
        this.reservationTime = dto.getReservationTime();
        this.symptom = dto.getSymptom();
    }

    public void updateReservationStatusFromDto(ReservationStatusUpdateRequestDto dto) {
        this.status = dto.getStatus();
    }
}
