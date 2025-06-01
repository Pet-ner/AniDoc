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

    List<Reservation> findByDoctorIdAndStatus(Long doctorId, ReservationStatus status);

    //대시보드 상단통계카드
    //추가(보호자) - 오늘의 예약 (기존)
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.user.id = :userId " +
            "AND DATE(r.reservationDate) = :today " +
            "AND r.status = 'APPROVED'")
    int countTodayReservationsByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);


    // ReservationRepository에 추가할 메서드들

    // 1. 사용자별 예약 조회 (대시보드용)
    @Query("SELECT r FROM Reservation r " +
            "LEFT JOIN FETCH r.user " +
            "LEFT JOIN FETCH r.pet " +
            "LEFT JOIN FETCH r.doctor " +
            "WHERE r.user = :user " +
            "ORDER BY r.reservationDate DESC, r.reservationTime DESC")
    List<Reservation> findByUserWithDetailsOrderByReservationDateDescReservationTimeDesc(@Param("user") User user);

    // 2. 날짜별 예약 조회 (캘린더용)
    @Query("SELECT r FROM Reservation r " +
            "LEFT JOIN FETCH r.user " +
            "LEFT JOIN FETCH r.pet " +
            "LEFT JOIN FETCH r.doctor " +
            "WHERE r.reservationDate = :date " +
            "ORDER BY r.reservationTime")
    List<Reservation> findByReservationDateWithDetailsOrderByReservationTime(@Param("date") LocalDate date);

    // 3. 반려동물별 예약 조회
    @Query("SELECT r FROM Reservation r " +
            "LEFT JOIN FETCH r.user " +
            "LEFT JOIN FETCH r.pet " +
            "LEFT JOIN FETCH r.doctor " +
            "WHERE r.pet = :pet " +
            "ORDER BY r.reservationDate DESC, r.reservationTime DESC")
    List<Reservation> findByPetWithDetailsOrderByReservationDateDescReservationTimeDesc(@Param("pet") Pet pet);

    // 4. 의사별 예약 조회
    @Query("SELECT r FROM Reservation r " +
            "LEFT JOIN FETCH r.user " +
            "LEFT JOIN FETCH r.pet " +
            "LEFT JOIN FETCH r.doctor " +
            "WHERE r.doctor.id = :doctorId AND r.status = :status")
    List<Reservation> findByDoctorIdAndStatusWithDetails(@Param("doctorId") Long doctorId, @Param("status") ReservationStatus status);



    // 오늘의 미완료 예약 (APPROVED 상태이면서 진료/예방접종 완료되지 않은 것만)
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.user.id = :userId " +
            "AND r.reservationDate = :today " +
            "AND r.status = 'APPROVED' " +  // PENDING 제외, APPROVED만
            "AND NOT EXISTS (SELECT 1 FROM MedicalRecord m WHERE m.reservation.id = r.id) " +
            "AND NOT EXISTS (SELECT 1 FROM Vaccination v WHERE v.reservation.id = r.id)")
    int countTodayIncompleteReservationsByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);


    // 미래의 승인된 예약 (오늘 제외, 오늘 이후, APPROVED만)
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.user.id = :userId " +
            "AND r.reservationDate > :today " +
            "AND r.status = :status")
    int countFutureReservationsByUserIdAndStatus(
            @Param("userId") Long userId,
            @Param("today") LocalDate today,
            @Param("status") ReservationStatus status);

    //추가(의료진, 관리자)
    // 의료진용: 오늘 전체 예약 수
    int countByReservationDate(LocalDate date);

    // 의료진용: 승인 대기 예약 수
    int countByStatus(ReservationStatus status);

    // 특정 의료진의 오늘 예약 수
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.doctor.id = :doctorId AND DATE(r.reservationDate) = :date")
    int countByDoctorIdAndReservationDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    // 관리자용: 오늘의 확정된 예약 수만 계산
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.reservationDate = :date AND r.status = 'APPROVED'")
    int countApprovedReservationsByDate(@Param("date") LocalDate date);

}


