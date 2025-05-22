package com.petner.anidoc.domain.vet.reservation.controller;

import com.petner.anidoc.domain.vet.reservation.dto.*;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import com.petner.anidoc.domain.vet.reservation.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservations")
@Tag(name = "예약", description = "Reservation 관련 API")
public class ReservationController {

    private final ReservationService reservationService;

    @Operation(summary = "예약 생성", description = "새로운 진료 예약을 생성합니다.")
    @PostMapping
    public ResponseEntity<ReservationResponseDto> createReservation(
            @RequestParam Long userId,
            @RequestBody ReservationRequestDto requestDto) {
        return new ResponseEntity<>(reservationService.createReservation(userId, requestDto), HttpStatus.CREATED);
    }

    @Operation(summary = "유저 예약 목록 조회", description = "특정 유저의 모든 예약 목록을 조회합니다.")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReservationResponseDto>> getUserReservations(
            @PathVariable Long userId) {
        return ResponseEntity.ok(reservationService.getUserReservations(userId));
    }

    @Operation(summary = "반려동물 예약 목록 조회", description = "특정 반려동물의 모든 예약 목록을 조회합니다.")
    @GetMapping("/pet/{petId}")
    public ResponseEntity<List<ReservationResponseDto>> getPetReservations(
            @PathVariable Long petId) {
        return ResponseEntity.ok(reservationService.getPetReservations(petId));
    }

    @Operation(summary = "예약 상세 조회", description = "특정 예약의 상세 정보를 조회합니다.")
    @GetMapping("/{reservationId}")
    public ResponseEntity<ReservationResponseDto> getReservation(
            @PathVariable Long reservationId) {
        return ResponseEntity.ok(reservationService.getReservation(reservationId));
    }

    @Operation(summary = "예약 수정", description = "기존 예약 정보를 수정합니다.")
    @PutMapping("/{reservationId}")
    public ResponseEntity<ReservationResponseDto> updateReservation(
            @RequestParam Long userId,
            @PathVariable Long reservationId,
            @RequestBody ReservationUpdateRequestDto requestDto) {
        return ResponseEntity.ok(reservationService.updateReservation(userId, reservationId, requestDto));
    }

    @Operation(summary = "담당의 배정", description = "예약에 담당의를 배정합니다. (관리자만 가능)")
    @PatchMapping("/{reservationId}/doctor")
    public ResponseEntity<ReservationResponseDto> assignDoctor(
            @RequestParam Long userId,
            @PathVariable Long reservationId,
            @RequestBody DoctorAssignRequestDto requestDto) {
        return ResponseEntity.ok(reservationService.assignDoctor(userId, reservationId, requestDto));
    }

    @Operation(summary = "예약 상태 변경", description = "예약의 상태를 변경합니다. (관리자 또는 의료진만 가능)")
    @PatchMapping("/{reservationId}/status")
    public ResponseEntity<ReservationResponseDto> updateReservationStatus(
            @RequestParam Long userId,
            @PathVariable Long reservationId,
            @RequestBody ReservationStatusUpdateRequestDto requestDto) {
        return ResponseEntity.ok(reservationService.updateReservationStatus(userId, reservationId, requestDto));
    }

    @Operation(summary = "예약 취소", description = "예약을 취소합니다.")
    @DeleteMapping("/{reservationId}")
    public ResponseEntity<Void> cancelReservation(
            @RequestParam Long userId,
            @PathVariable Long reservationId) {
        reservationService.cancelReservation(userId, reservationId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "날짜별 예약 목록 조회", description = "특정 날짜의 모든 예약 목록을 조회합니다.")
    @GetMapping("/date/{date}")
    public ResponseEntity<List<ReservationResponseDto>> getReservationsByDate(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return ResponseEntity.ok(reservationService.getReservationsByDate(date));
    }

    @Operation(summary = "예약 가능한 시간 슬롯 조회", description = "특정 날짜에 예약 가능한 시간 슬롯 목록을 조회합니다.")
    @GetMapping("/available-slots/{date}")
    public ResponseEntity<List<TimeSlotResponseDto>> getAvailableTimeSlots(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return ResponseEntity.ok(reservationService.getAvailableTimeSlots(date));
    }

    @Operation(summary = "월별 예약 캘린더 정보 조회", description = "특정 월의 예약 캘린더 정보를 조회합니다.")
    @GetMapping("/calendar")
    public ResponseEntity<Map<String, Object>> getMonthlyReservationCalendar(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(reservationService.getMonthlyReservationCalendar(year, month));
    }

    @Operation(summary = "예약 시간 슬롯 조회", description = "예약 시간 슬롯 목록을 조회합니다.")
    @GetMapping("/time-slots")
    public ResponseEntity<List<LocalTime>> getTimeSlots() {
        return ResponseEntity.ok(Reservation.RESERVATION_TIMES);
    }

    @Operation(summary = "의료진 배정 + 승인된 예약 목록 조회")
    @GetMapping("/approved")
    public ResponseEntity<List<ReservationResponseDto>> getApprovedReservationsForDoctor(
            @RequestParam Long doctorId) {
        return ResponseEntity.ok(reservationService.getApprovedReservationsForDoctor(doctorId));
    }

}