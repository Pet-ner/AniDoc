package com.petner.anidoc.domain.vet.reservation.repository;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import com.petner.anidoc.domain.vet.reservation.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // 사용자별 예약 조회
    List<Reservation> findByUserOrderByReservationDateDescReservationTimeDesc(User user);

    // 반려동물별 예약 조회
    List<Reservation> findByPetOrderByReservationDateDescReservationTimeDesc(Pet pet);

    // 날짜별 예약 조회
    List<Reservation> findByReservationDateOrderByReservationTime(LocalDate reservationDate);

    // 특정 날짜와 시간에 등록된 예약 찾기 (승인거부된 예약 제외)
    List<Reservation> findByReservationDateAndReservationTimeAndStatusNot(
            LocalDate date, LocalTime time, ReservationStatus status);

    // 특정 날짜에 예약된 시간 슬롯 목록 조회
    @Query("SELECT r.reservationTime FROM Reservation r WHERE r.reservationDate = :date AND r.status != 'REJECTED'")
    List<LocalTime> findNonRejectedTimesByDate(@Param("date") LocalDate date);

    // 특정 달의 예약이 있는 날짜 목록 조회 (캘린더 표시용)
    @Query("SELECT DISTINCT r.reservationDate FROM Reservation r WHERE YEAR(r.reservationDate) = :year AND MONTH(r.reservationDate) = :month")
    List<LocalDate> findReservationDatesByYearAndMonth(@Param("year") int year, @Param("month") int month);

}
