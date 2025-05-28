package com.petner.anidoc.domain.user.notification.scheduler;

import com.petner.anidoc.domain.user.notification.dto.PetInfoDto;
import com.petner.anidoc.domain.user.notification.service.NotificationService;
import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.pet.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "scheduler.enabled", havingValue = "true", matchIfMissing = true)
public class VaccinationScheduler {

    private final NotificationService notificationService;
    private final PetRepository petRepository;

    /**
     * 매일 오전 10시에 알림 체크
     * cron = "초 분 시 일 월 요일"
     */
    @Scheduled(cron = "0 0 10 * * *")
    public void checkVaccinationReminders(){
        log.info("예방접종 알림 스케줄러");

        List<Pet> alivePets = petRepository.findByIsDeceasedFalse();

        int processedCount = 0;

        for(Pet pet : alivePets){
            PetInfoDto petDto = PetInfoDto.from(pet);
            notificationService.sendVaccinationReminder(petDto);
            processedCount++;
        }

        log.info("예방접종 알림 스케줄러 완료 {}건", processedCount);

    }
}
