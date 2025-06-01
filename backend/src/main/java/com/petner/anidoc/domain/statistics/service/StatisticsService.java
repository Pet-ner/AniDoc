package com.petner.anidoc.domain.statistics.service;

import com.petner.anidoc.domain.statistics.dto.*;
import com.petner.anidoc.domain.statistics.repository.StatisticsRepository;
import com.petner.anidoc.domain.user.pet.repository.PetRepository;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.medicalrecord.repository.MedicalRecordRepository;
import com.petner.anidoc.domain.vet.reservation.entity.ReservationStatus;
import com.petner.anidoc.domain.vet.reservation.repository.ReservationRepository;
import com.petner.anidoc.domain.vet.vaccination.repository.VaccinationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final StatisticsRepository statisticsRepository;
    //추가
    private final PetRepository petRepository;
    private final ReservationRepository reservationRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final VaccinationRepository vaccineRepository;

    //전주 방문자 통계
    @Transactional
    public WeeklyStatisticsDto getLastWeekWeekStatistics(){
        LocalDateTime now = LocalDateTime.now();

        //이번 주 월요일 0시
        LocalDateTime end = now.minusDays(now.getDayOfWeek().getValue() - 1)
                .withHour(0).withMinute(0).withSecond(0);

        //지난 주 월요일 0시
        LocalDateTime start = end.minusWeeks(1);

        Long visitCount = statisticsRepository.countLastWeekVisits(start, end);

        String period ="지난 주: " + start.format(DateTimeFormatter.ofPattern("MM월 dd일"))
                + " ~ " + end.format(DateTimeFormatter.ofPattern("MM월 dd일"));

        return new WeeklyStatisticsDto(period, visitCount);
    }

    //전월 방문자 통계
    @Transactional
    public MonthlyStatisticsDto getLastMonthWeekStatistics(){
        LocalDateTime now = LocalDateTime.now();

        //이번 달 1일 0시 0분
        LocalDateTime end = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        //지난 달 1일 0시 0분
        LocalDateTime start = end.minusMonths(1);

        Long visitCount = statisticsRepository.countLastMonthVisits(start, end);

        String period = start.format(DateTimeFormatter.ofPattern("yyyy년 MM월"));

        return new MonthlyStatisticsDto(period, visitCount);

    }

    //전주 방문자 비교
    @Transactional
    public WeeklyComparisonDto getWeeklyComparison(){
        WeeklyStatisticsDto lastWeek = getLastWeekWeekStatistics();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusDays(now.getDayOfWeek().getValue() - 1)
                .withHour(0).withMinute(0).withSecond(0);
        Long thisWeekVisitCount = statisticsRepository.countLastWeekVisits(start, now);

        String thisWeekPeriod = "이번 주: "+ start.format(DateTimeFormatter.ofPattern("MM월 dd일"))
                +" ~ " + now.format(DateTimeFormatter.ofPattern("MM월 dd일"));

        String trend = calculateTrend(lastWeek.getVisitCount(), thisWeekVisitCount);
        String changeRate = calculateChangeRate(lastWeek.getVisitCount(), thisWeekVisitCount);

        return new WeeklyComparisonDto(lastWeek.getPeriod(), lastWeek.getVisitCount(), thisWeekPeriod, thisWeekVisitCount, trend, changeRate);
    }

    //전월 방문자 비교
    @Transactional
    public MonthlyComparisonDto getMonthlyComparison(){
        MonthlyStatisticsDto lastMonth = getLastMonthWeekStatistics();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        Long thisMonthVisitCount = statisticsRepository.countLastMonthVisits(start, now);

        String thisMonthPeriod = start.format(DateTimeFormatter.ofPattern("yyyy년 MM월"));

        String trend = calculateTrend(lastMonth.getVisitCount(), thisMonthVisitCount);
        String changeRate = calculateChangeRate(lastMonth.getVisitCount(), thisMonthVisitCount);

        return new MonthlyComparisonDto(lastMonth.getPeriod(), lastMonth.getVisitCount(), thisMonthPeriod, thisMonthVisitCount, trend, changeRate);
    }

    //지난 달 강아지/고양이/기타 전체 진료 기준 비율 통계
    @Transactional
    public AnimalTypeDto getLastMonthAnimalTypeRate(){
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime end = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime start = end.minusMonths(1);

        Long dogCount = statisticsRepository.countDogTreatments(start, end);
        Long catCount = statisticsRepository.countCatTreatments(start, end);
        Long otherCount = statisticsRepository.countOtherTreatments(start, end);
        Long totalCount = dogCount + catCount + otherCount;

        String period = start.format(DateTimeFormatter.ofPattern("yyyy년 MM월"));

        return new AnimalTypeDto(period, dogCount, catCount, otherCount, totalCount);
    }

    //비교 로직
    private String calculateTrend(Long previous , Long current){
        if(current > previous){
            return "증가";
        }else  if(current <previous){
            return "감소";
        } else {return " 동일";}
    }

    private String calculateChangeRate(Long previous , Long current){
        if(previous == 0){
            return current > 0 ? "+100%" : "0%";
        }

        double rate = ((double) (current - previous) /previous) * 100;
        return String.format("%.0f%%", rate);
    }


    // 대시보드 상단통계카드
    // 보호자별 통계
    public UserStatsDto getUserStats(Long userId, UserDetails currentUser) {
    // 권한 체크
        validateUserAccess(userId, currentUser);

    // 통계 계산 로직
        return UserStatsDto.builder()
                .todayReservations(calculateTodayReservations(userId))
                .upcomingReservations(calculateUpcomingReservations(userId))
                .pendingReservations(calculatePendingReservations(userId)) // 추가
                .totalPets(calculateTotalPets(userId))
                .totalTreatments(calculateTotalTreatments(userId))
                .lastVisitDate(getLastVisitDate(userId))
                .build();
    }

    // 누락된 메서드들 추가
    private void validateUserAccess(Long userId, UserDetails currentUser) {
        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("보호자 정보를 찾을 수 없습니다."));

        // 본인의 통계만 조회 가능하도록 권한 체크 (관리자/직원은 모든 보호자 조회 가능)
        if (!user.getId().equals(userId) &&
                user.getRole() != UserRole.ROLE_ADMIN &&
                user.getRole() != UserRole.ROLE_STAFF) {
            throw new RuntimeException("본인의 통계만 조회할 수 있습니다.");
        }
    }

    private int calculateTodayReservations(Long userId) {
        LocalDate today = LocalDate.now();
        return reservationRepository.countTodayReservationsByUserId(userId, today);
    }

    // 예정된 예약 수 계산
    private int calculateUpcomingReservations(Long userId) {
        LocalDate today = LocalDate.now();

    // 1. 오늘의 미완료 예약 (진료/예방접종 완료되지 않은 것)
        int todayIncomplete = reservationRepository.countTodayIncompleteReservationsByUserId(userId, today);

    // 2. 미래의 승인된 예약 (오늘 이후)
        int futureApproved = reservationRepository.countFutureReservationsByUserIdAndStatus(
                userId, today, ReservationStatus.APPROVED);

    // 3. 합계 반환
        return todayIncomplete + futureApproved;
    }

    // 보호자별 승인 대기 예약 수 계산 (추가)
    private int calculatePendingReservations(Long userId) {
        LocalDate today = LocalDate.now();

    // 오늘 + 미래의 PENDING 상태 예약
        return reservationRepository.countByStatus(ReservationStatus.PENDING);
    }

    private int calculateTotalPets(Long userId) {
        return petRepository.countByOwnerId(userId);
    }

    private int calculateTotalTreatments(Long userId) {
        return medicalRecordRepository.countTreatmentsByOwnerId(userId);
    }

    private LocalDate getLastVisitDate(Long userId) {
        return medicalRecordRepository.findLatestTreatmentDateByOwnerId(userId)
                .map(LocalDateTime::toLocalDate)
                .orElse(null);
    }

    // 관리자 대시보드 통계 (수정됨)
    public AdminStatsDto getAdminDashboardStats(UserDetails currentUser) {
    // 권한 체크
        validateAdminAccess(currentUser);

        return AdminStatsDto.builder()
                .todayTotalReservations(calculateTodayTotalReservations()) // 수정됨
                .totalPets(calculateTotalPetsInHospital())
                .pendingReservations(calculatePendingReservations())
                .weeklyCompletedTreatments(calculateWeeklyCompletedTreatments())
                .recentVaccinations(calculateRecentVaccinations())
                .build();
    }

    // 의료진 대시보드 통계
    public StaffStatsDto getStaffDashboardStats(UserDetails currentUser) {
    // 권한 체크 및 의료진 정보 조회
        User staff = validateStaffAccess(currentUser);

        return StaffStatsDto.builder()
                .todayMyReservations(calculateTodayMyReservations(staff.getId()))
                .myTreatedPets(calculateMyTreatedPets(staff.getId()))
                .pendingReservations(calculatePendingReservations())
                .weeklyMyTreatments(calculateWeeklyMyTreatments(staff.getId()))
                .weeklyVaccinations(calculateWeeklyMyVaccinations(staff.getId()))
                .build();
    }

    // 권한 체크
    private void validateAdminAccess(UserDetails currentUser) {
        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("보호자 정보를 찾을 수 없습니다."));

        if (user.getRole() != UserRole.ROLE_ADMIN) {
            throw new RuntimeException("관리자만 접근할 수 있습니다.");
        }
    }

    private User validateStaffAccess(UserDetails currentUser) {
        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("보호자 정보를 찾을 수 없습니다."));

        if (user.getRole() != UserRole.ROLE_STAFF) {
            throw new RuntimeException("의료진만 접근할 수 있습니다.");
        }

        return user; // 의료진 정보 반환
    }

    // 관리자용 메서드들 (수정됨)
    private int calculateTodayTotalReservations() {
        LocalDate today = LocalDate.now();
    // 확정된 예약만 계산
        return reservationRepository.countApprovedReservationsByDate(today);
    }

    private int calculateTotalPetsInHospital() {
        return (int) petRepository.count();
    }

    private int calculatePendingReservations() {
        return reservationRepository.countByStatus(ReservationStatus.PENDING);
    }

    // 관리자용 주간 완료된 진료 수 (수정됨 - 월~일 기준)
    private int calculateWeeklyCompletedTreatments() {
        LocalDateTime[] weekRange = getWeekRange();
        LocalDateTime startDateTime = weekRange[0];  // 월요일 00:00:00
        LocalDateTime endDateTime = weekRange[1];    // 일요일 23:59:59

        return medicalRecordRepository.countByIsDeletedFalseAndCreatedAtBetween(
                startDateTime,
                endDateTime
        );
    }

    // 관리자용 주간 예방접종 계산 (수정됨 - 월~일 기준)
    private int calculateRecentVaccinations() {
        LocalDateTime[] weekRange = getWeekRange();
        LocalDateTime startDateTime = weekRange[0];  // 월요일 00:00:00
        LocalDateTime endDateTime = weekRange[1];    // 일요일 23:59:59

        return vaccineRepository.countByCreatedAtBetween(startDateTime, endDateTime);
    }

    // 의료진용 새로운 메서드들
    private int calculateTodayMyReservations(Long doctorId) {
        LocalDate today = LocalDate.now();
        return reservationRepository.countByDoctorIdAndReservationDate(doctorId, today);
    }

    private int calculateMyTreatedPets(Long doctorId) {
        return medicalRecordRepository.countDistinctPetsByDoctorId(doctorId);
    }

    // 의료진용 주간 진료 수 (수정됨 - 월~일 기준)
    private int calculateWeeklyMyTreatments(Long doctorId) {
        LocalDateTime[] weekRange = getWeekRange();
        LocalDateTime startDateTime = weekRange[0];  // 월요일 00:00:00
        LocalDateTime endDateTime = weekRange[1];    // 일요일 23:59:59

        return medicalRecordRepository.countByDoctorIdAndIsDeletedFalseAndCreatedAtBetween(
                doctorId,
                startDateTime,
                endDateTime
        );
    }

    // 의료진용 주간 예방접종 계산 (수정됨 - 월~일 기준)
    private int calculateWeeklyMyVaccinations(Long doctorId) {
        LocalDateTime[] weekRange = getWeekRange();
        LocalDateTime startDateTime = weekRange[0];  // 월요일 00:00:00
        LocalDateTime endDateTime = weekRange[1];    // 일요일 23:59:59

        return vaccineRepository.countByDoctorIdAndCreatedAtBetween(
                doctorId,
                startDateTime,
                endDateTime
        );
    }
        //주간 통계(월~일기준)단위로 계산
        private LocalDateTime[] getWeekRange() {
            LocalDate today = LocalDate.now();

            // 이번 주 월요일 계산
            LocalDate monday = today.minusDays(today.getDayOfWeek().getValue() - 1);

            // 이번 주 일요일 계산
            LocalDate sunday = monday.plusDays(6);

            return new LocalDateTime[]{
                    monday.atStartOfDay(),
                    sunday.atTime(23, 59, 59)
            };
        }
}
