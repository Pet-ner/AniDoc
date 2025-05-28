package com.petner.anidoc.domain.user.notification.util;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class VaccinationScheduleManager {

    //강아지 예방접종 주기
    private static final List<VaccinationSchedule> dogSchedule = Arrays.asList(
            VaccinationSchedule.builder().round(1).startWeek(6).endWeek(8).vaccineTypes("종합백신, 코로나장염")
              .build(),
            VaccinationSchedule.builder().round(2).startWeek(8).endWeek(10).vaccineTypes("종합백신, 코로나장염")
                    .build(),
            VaccinationSchedule.builder().round(3).startWeek(10).endWeek(12).vaccineTypes("종합백신, 켄넬코프")
                    .build(),
            VaccinationSchedule.builder().round(4).startWeek(12).endWeek(14).vaccineTypes("종합백신, 켄넬코프")
                    .build(),
            VaccinationSchedule.builder().round(5).startWeek(14).endWeek(16).vaccineTypes("종합백신, 인플루엔자")
                    .build(),
            VaccinationSchedule.builder().round(6).startWeek(16).endWeek(18).vaccineTypes("광견병, 인플루엔자, 항체가검사")
                    .build()
    );

    //고양이 예방접종 주기
    private static final List<VaccinationSchedule> catSchedule = Arrays.asList(
            VaccinationSchedule.builder().round(1).startWeek(6).endWeek(8).vaccineTypes("종합백신")
                    .build(),
            VaccinationSchedule.builder().round(2).startWeek(8).endWeek(10).vaccineTypes("종합백신")
                    .build(),
            VaccinationSchedule.builder().round(3).startWeek(10).endWeek(12).vaccineTypes("종합백신, 광견병")
                    .build(),
            VaccinationSchedule.builder().round(4).startWeek(12).endWeek(14).vaccineTypes("전염성 복막염")
                    .build(),
            VaccinationSchedule.builder().round(5).startWeek(14).endWeek(16).vaccineTypes("항체가검사")
                    .build()
    );

    // 반려동물 타입 및 접종 스케줄(주차) 조회
    public VaccinationSchedule getNextVaccination(String petType, int currentWeek){
        List<VaccinationSchedule> schedule = getScheduleByPetType(petType);
        if(schedule == null) return null;

        return schedule.stream()
                .filter(v -> currentWeek >= v.getStartWeek() && currentWeek <= v.getEndWeek())
                .findFirst()
                .orElse(null);
    }

    //대상 확인
    public boolean isVaccinationDue(String petType, int currentWeek){
        return getScheduleByPetType(petType) != null;
    }

    //반려동물 타입에 따른 스케줄 반환
    private List<VaccinationSchedule> getScheduleByPetType(String petType){
       if(petType == null) return null;

       String type = petType.toLowerCase();

       //강아지 확인
        if(type.contains("강아지") || type.contains("개")){
            return dogSchedule;
        }

        //고양이 확인
        if (type.contains("고양이")){
            return catSchedule;
        }
        return null;
    }


}
