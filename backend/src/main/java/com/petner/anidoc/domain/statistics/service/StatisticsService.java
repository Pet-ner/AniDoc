package com.petner.anidoc.domain.statistics.service;

import com.petner.anidoc.domain.statistics.dto.*;
import com.petner.anidoc.domain.statistics.repository.StatisticsRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final StatisticsRepository statisticsRepository;

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


}
