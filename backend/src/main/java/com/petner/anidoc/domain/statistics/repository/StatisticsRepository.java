package com.petner.anidoc.domain.statistics.repository;

import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface StatisticsRepository extends JpaRepository<MedicalRecord, Long> {

    //전주 방문 건수
    @Query("SELECT COUNT(m) FROM MedicalRecord m "
            +"WHERE m.createdAt >= :startDate And m.createdAt < :endDate")
    Long countLastWeekVisits(@Param("startDate")LocalDateTime startDate,
                             @Param("endDate")LocalDateTime endDate);

    //이번 주 방문 건수
    @Query("SELECT COUNT(m) FROM MedicalRecord m "
            +"WHERE m.createdAt >= :startDate And m.createdAt <= :endDate")
    Long countThisWeekVisits(@Param("startDate")LocalDateTime startDate,
                             @Param("endDate")LocalDateTime endDate);

    //전월 방문 건수
    @Query("SELECT COUNT(m) FROM MedicalRecord m"
    + " WHERE m.createdAt >= :startDate AND m.createdAt < :endDate")
    Long countLastMonthVisits(@Param("startDate")LocalDateTime startDate,
                              @Param("endDate")LocalDateTime endDate);


    //이번 달 방문 건수
    @Query("SELECT COUNT(m) FROM MedicalRecord m"
            + " WHERE m.createdAt >= :startDate AND m.createdAt <= :endDate")
    Long countThisMonthVisits(@Param("startDate")LocalDateTime startDate,
                              @Param("endDate")LocalDateTime endDate);


    //예방접종 건수
    @Query("SELECT COUNT(m) FROM MedicalRecord m"
            + " WHERE m.createdAt >= :startDate AND m.createdAt < :endDate"
            + " AND (m.diagnosis LIKE '%예방접종%' OR m.diagnosis LIKE '%접종%' OR m.diagnosis LIKE '%백신%')" )
    Long countVaccinated(@Param("startDate")LocalDateTime startDate,
                              @Param("endDate")LocalDateTime endDate);


    //강아지 진료 건수(전체 진료)
    @Query("SELECT COUNT(m) FROM MedicalRecord  m " +
            " WHERE m.createdAt >= :startDate AND m.createdAt < :endDate" +
            " AND m.pet.species = '강아지'")
    Long countDogTreatments(@Param("startDate")LocalDateTime startDate,
                              @Param("endDate")LocalDateTime endDate);


    //고양이 진료 건수(전체 진료)
    @Query("SELECT COUNT(m) FROM MedicalRecord  m " +
            " WHERE m.createdAt >= :startDate AND m.createdAt < :endDate" +
            " AND m.pet.species = '고양이'")
    Long countCatTreatments(@Param("startDate")LocalDateTime startDate,
                              @Param("endDate")LocalDateTime endDate);


    //기타 동물 진료 건수(전체 진료)
    @Query("SELECT COUNT(m) FROM MedicalRecord  m " +
            " WHERE m.createdAt >= :startDate AND m.createdAt < :endDate" +
            " AND m.pet.species NOT IN ('강아지', '고양이') ")
    Long countOtherTreatments(@Param("startDate")LocalDateTime startDate,
                              @Param("endDate")LocalDateTime endDate);

}

