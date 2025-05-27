package com.petner.anidoc.domain.user.notification.util;

import com.petner.anidoc.domain.user.notification.dto.PetInfoDto;
import com.petner.anidoc.domain.user.notification.dto.VaccinationNotificationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class VaccinationNotificationHelper {
    private final VaccinationScheduleManager scheduleManager;

    public boolean shouldSendVaccination(PetInfoDto petDto) {
        //사망한 반려동물 제외
        if (petDto.isDeceased()) return false;

        //강아지, 고양이 아니면 제외
        if (!scheduleManager.isVaccinationDue(petDto.getSpecies(), 0)) {
            return false;
        }

        //접종 시기 확인
        int currentWeek = calculateWeeks(petDto.getBirth());
        VaccinationSchedule nextVaccination = scheduleManager.getNextVaccination(petDto.getSpecies(), currentWeek);

        if(nextVaccination == null) return false;

        // 접종 시작 5일 전
        LocalDate vaccinationStartDate = petDto.getBirth().plusWeeks(nextVaccination.getStartWeek());
        LocalDate reminderDate = vaccinationStartDate.minusDays(5);
        LocalDate now = LocalDate.now();

        return now.equals(reminderDate) || now.isAfter(reminderDate);

    }

    //알림 DTO
    public VaccinationNotificationDto createVaccinationDto(PetInfoDto petDto){
        int currentWeek = calculateWeeks(petDto.getBirth());
        VaccinationSchedule schedule = scheduleManager.getNextVaccination(petDto.getSpecies(), currentWeek);

        if(schedule == null) return null;

        return VaccinationNotificationDto.builder()
                .petId(petDto.getPetId())
                .petName(petDto.getName())
                .vaccineName(schedule.getVaccineTypes())
                .nextDueDate(calculateNextDueDate(petDto.getBirth(), schedule))
                .petType(determinePetType(petDto.getSpecies()))
                .round(schedule.getRound())
                .scheduleWeeks(String.format("생후 %d ~ %d주", schedule.getStartWeek(), schedule.getEndWeek()))
                .type("VACCINATION")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // 예방접종 알림 메시지
    public String createVaccinationMessage(PetInfoDto petDto){
        int currentWeek = calculateWeeks(petDto.getBirth());
        VaccinationSchedule schedule = scheduleManager.getNextVaccination(petDto.getSpecies(), currentWeek);

        if(schedule == null) return null;

        //접종기간 계산
        LocalDate start = petDto.getBirth().plusWeeks(schedule.getStartWeek());
        LocalDate end = petDto.getBirth().plusWeeks(schedule.getEndWeek());

        return String.format("5일 후 %s의 %d차 접종 기간이 시작됩니다. %s (%s ~ %s)", petDto.getName(), schedule.getRound(), schedule.getVaccineTypes()
        , start.toString(), end.toString());
    }

    /**
    심장사상충 알림
    마지막 투여일로부터 30일, 값이 없으면 매달 15일
    알림은 해당일 3일전에
    */
    //알림 확인
    public boolean shouldSendDiro(PetInfoDto petDto){
        LocalDate now = LocalDate.now();
        LocalDate lastDiro = petDto.getLastDiroDate();

        //마지막 투여일 30일 후 3일 전
        if(lastDiro != null) {
            LocalDate nextDueDate = lastDiro.plusDays(30);
            LocalDate reminderDate = nextDueDate.minusDays(3); // 27일 후
            return now.equals(reminderDate) || now.isAfter(reminderDate);
        }

        //투여일 없는 경우 매월 12일(15일의 3일전)
        return now.getDayOfMonth() == 12;
    }

    //심장사상충 알림메시지
    public String createDiroMessage(PetInfoDto petDto){
        LocalDate lastDiro = petDto.getLastDiroDate();

        if(lastDiro != null){
            LocalDate nextDueDate = lastDiro.plusDays(27);
            return String.format("3일 후 %s의 심장사상충 예방약 투여 예정일 입니다.(%s)"
                    ,petDto.getName(), nextDueDate.toString());
        }else {
            return String.format("3일 후 %s의 심장사상충 예방약 투여 예정일 입니다."
            ,petDto.getName());
        }
    }



    /*계산 메서드 */

    // 출생일 기준 주차 계산
    private int calculateWeeks(LocalDate birthDate){
        if(birthDate == null) return 0;

        return (int) ChronoUnit.WEEKS.between(birthDate, LocalDate.now());
    }

    // 반려동물 타입 확인
    private String determinePetType(String species){
        // 이미 1차적으로 기타 반려동물 제외
        if(species == null) return "강아지";

        String type = species.toLowerCase();

        if(type.contains("고양이")){
            return "고양이";
        }
        if(type.contains("강아지") || type.contains("개")){
            return "강아지";
        }
        return "강아지";
    }

    // 다음 접종 예정일
    private String calculateNextDueDate(LocalDate birthDate, VaccinationSchedule schedule){
        if(birthDate == null) return null;
        LocalDate dueDate = birthDate.plusWeeks(schedule.getStartWeek());
        return dueDate.toString();

    }

}
