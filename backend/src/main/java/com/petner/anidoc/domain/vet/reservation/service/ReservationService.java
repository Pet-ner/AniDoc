package com.petner.anidoc.domain.vet.reservation.service;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.pet.repository.PetRepository;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.reservation.dto.*;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import com.petner.anidoc.domain.vet.reservation.entity.ReservationStatus;
import com.petner.anidoc.domain.vet.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final PetRepository petRepository;

    // 유저 가져오기
    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }

    // 예약 생성
    @Transactional
    public ReservationResponseDto createReservation(Long userId, ReservationRequestDto requestDto) {
        User user = getUser(userId);
        Pet pet = petRepository.findById(requestDto.getPetId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 반려동물입니다."));

        // 예약 시간이 유효한지 확인
        if (!Reservation.isValidReservationTime(requestDto.getReservationTime())) {
            throw new IllegalArgumentException("유효하지 않은 예약 시간입니다.");
        }

        // 해당 날짜와 시간에 이미 예약이 있는지 확인 (REJECTED가 아닌 예약)
        List<Reservation> existingReservations = reservationRepository.findByReservationDateAndReservationTimeAndStatusNot(
                requestDto.getReservationDate(), requestDto.getReservationTime(), ReservationStatus.REJECTED);

        if (!existingReservations.isEmpty()) {
            throw new IllegalStateException("선택한 시간은 이미 예약이 되어 있습니다. 다른 시간을 선택해주세요.");
        }

        Reservation reservation = Reservation.builder()
                .user(user)
                .pet(pet)
                .reservationDate(requestDto.getReservationDate())
                .reservationTime(requestDto.getReservationTime())
                .status(ReservationStatus.PENDING)  // 기본 상태는 대기중
                .symptom(requestDto.getSymptom())
                .type(requestDto.getType())
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);

        // TODO: 알림 기능 추가 (의료진/관리자)

        return mapToResponseDto(savedReservation);
    }

    // 예약 목록 조회 (사용자별)
    public List<ReservationResponseDto> getUserReservations(Long userId) {
        User user = getUser(userId);
        List<Reservation> reservations = reservationRepository.findByUserOrderByReservationDateDescReservationTimeDesc(user);

        return reservations.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // 예약 목록 조회 (반려동물별)
    public List<ReservationResponseDto> getPetReservations(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 반려동물입니다."));

        List<Reservation> reservations = reservationRepository.findByPetOrderByReservationDateDescReservationTimeDesc(pet);

        return reservations.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // 예약 상세 조회
    public ReservationResponseDto getReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));

        return mapToResponseDto(reservation);
    }

    // 예약 수정
    @Transactional
    public ReservationResponseDto updateReservation(Long userId, Long reservationId, ReservationUpdateRequestDto requestDto) {
        User currentUser = getUser(userId);
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));

        // 본인의 예약인지 또는 관리자인지 확인
        if (!reservation.getUser().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        // 이미 승인된 예약인 경우 수정 불가 (관리자 제외)
        if (ReservationStatus.APPROVED.equals(reservation.getStatus()) && !currentUser.isAdmin()) {
            throw new IllegalStateException("이미 승인된 예약은 수정할 수 없습니다. 관리자에게 문의해주세요.");
        }

        // 새 예약 시간이 유효한지 확인
        if (requestDto.getReservationTime() != null && !Reservation.isValidReservationTime(requestDto.getReservationTime())) {
            throw new IllegalArgumentException("유효하지 않은 예약 시간입니다.");
        }

        // 날짜나 시간이 변경되는 경우, 중복 예약 확인
        if ((requestDto.getReservationDate() != null && !requestDto.getReservationDate().equals(reservation.getReservationDate())) ||
                (requestDto.getReservationTime() != null && !requestDto.getReservationTime().equals(reservation.getReservationTime()))) {

            LocalDate newDate = requestDto.getReservationDate() != null ? requestDto.getReservationDate() : reservation.getReservationDate();
            LocalTime newTime = requestDto.getReservationTime() != null ? requestDto.getReservationTime() : reservation.getReservationTime();

            // 해당 날짜와 시간에 다른 예약이 있는지 확인
            List<Reservation> existingReservations = reservationRepository.findByReservationDateAndReservationTimeAndStatusNot(
                    newDate, newTime, ReservationStatus.REJECTED);

            // 현재 수정 중인 예약을 제외한 다른 예약이 있는지 확인
            boolean hasOtherReservation = existingReservations.stream()
                    .anyMatch(r -> !r.getId().equals(reservation.getId()));

            if (hasOtherReservation) {
                throw new IllegalStateException("선택한 시간은 이미 예약이 되어 있습니다. 다른 시간을 선택해주세요.");
            }
        }

        // 예약 정보 업데이트
        Reservation updatedReservation = Reservation.builder()
                .id(reservation.getId())
                .user(reservation.getUser())
                .pet(reservation.getPet())
                .reservationDate(requestDto.getReservationDate() != null ? requestDto.getReservationDate() : reservation.getReservationDate())
                .reservationTime(requestDto.getReservationTime() != null ? requestDto.getReservationTime() : reservation.getReservationTime())
                .status(currentUser.isAdmin() ? reservation.getStatus() : ReservationStatus.PENDING)  // 관리자가 아니면 수정 시 다시 대기 상태로
                .symptom(requestDto.getSymptom() != null ? requestDto.getSymptom() : reservation.getSymptom())
                .type(reservation.getType())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .build();

        updatedReservation = reservationRepository.save(updatedReservation);

        // TODO: 알림 기능 추가 (의료진/관리자)

        return mapToResponseDto(updatedReservation);
    }

    // 예약 상태 변경 (관리자/의료진용)
    @Transactional
    public ReservationResponseDto updateReservationStatus(Long userId, Long reservationId, ReservationStatusUpdateRequestDto requestDto) {
        User currentUser = getUser(userId);

        // 관리자 또는 의료진 권한 확인
        if (!currentUser.isAdmin() && !currentUser.getRole().equals(UserRole.ROLE_STAFF)) {
            throw new IllegalArgumentException("상태 변경 권한이 없습니다.");
        }

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));


        Reservation updatedReservation = Reservation.builder()
                .id(reservation.getId())
                .user(reservation.getUser())
                .pet(reservation.getPet())
                .reservationDate(reservation.getReservationDate())
                .reservationTime(reservation.getReservationTime())
                .status(requestDto.getStatus())
                .symptom(reservation.getSymptom())
                .type(reservation.getType())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .build();

        updatedReservation = reservationRepository.save(updatedReservation);

        // TODO: 알림 기능 추가 (사용자)

        return mapToResponseDto(updatedReservation);
    }

    // 예약 취소
    @Transactional
    public void cancelReservation(Long userId, Long reservationId) {
        User currentUser = getUser(userId);
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));

        // 본인의 예약인지 또는 관리자인지 확인
        if (!reservation.getUser().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new IllegalArgumentException("취소 권한이 없습니다.");
        }

        // 이미 승인된 예약인 경우 취소 불가 (관리자는 가능)
        if (ReservationStatus.APPROVED.equals(reservation.getStatus()) && !currentUser.isAdmin()) {
            throw new IllegalStateException("이미 승인된 예약은 취소할 수 없습니다. 관리자에게 문의해주세요.");
        }

        reservationRepository.delete(reservation);

        // TODO: 알림 기능 추가 (예약취소)
    }

    // 날짜별 예약 조회 (관리자/의료진용)
    public List<ReservationResponseDto> getReservationsByDate(LocalDate date) {
        List<Reservation> reservations = reservationRepository.findByReservationDateOrderByReservationTime(date);

        return reservations.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // 예약 가능한 시간 슬롯 조회
    public List<TimeSlotResponseDto> getAvailableTimeSlots(LocalDate date) {
        // 해당 날짜에 이미 예약된 시간 목록 조회
        List<LocalTime> reservedTimes = reservationRepository.findNonRejectedTimesByDate(date);

        // 모든 가능한 시간 슬롯에 대해 예약 가능 여부 확인
        return Reservation.RESERVATION_TIMES.stream()
                .map(time -> TimeSlotResponseDto.builder()
                        .time(time)
                        .available(!reservedTimes.contains(time))
                        .build())
                .collect(Collectors.toList());
    }

    // 월별 예약 일정 조회 (캘린더 표시용)
    public Map<String, Object> getMonthlyReservationCalendar(int year, int month) {
        // 해당 달의 예약이 있는 날짜 목록 조회
        List<LocalDate> reservationDates = reservationRepository.findReservationDatesByYearAndMonth(year, month);

        // 해당 달의 날짜별 예약 수 계산
        Map<LocalDate, Long> reservationCountByDate = reservationDates.stream()
                .collect(Collectors.groupingBy(date -> date, Collectors.counting()));

        // 해당 달의 모든 날짜 생성
        YearMonth yearMonth = YearMonth.of(year, month);
        List<Map<String, Object>> calendarDays = new ArrayList<>();

        for (int i = 1; i <= yearMonth.lengthOfMonth(); i++) {
            LocalDate date = LocalDate.of(year, month, i);
            Map<String, Object> dayInfo = new HashMap<>();
            dayInfo.put("date", date);
            dayInfo.put("hasReservation", reservationCountByDate.containsKey(date));
            dayInfo.put("count", reservationCountByDate.getOrDefault(date, 0L));
            calendarDays.add(dayInfo);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("year", year);
        result.put("month", month);
        result.put("days", calendarDays);

        return result;
    }

    // Reservation 엔티티를 DTO로 변환
    private ReservationResponseDto mapToResponseDto(Reservation reservation) {
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