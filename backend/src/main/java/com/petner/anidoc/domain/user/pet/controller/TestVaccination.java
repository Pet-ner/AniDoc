package com.petner.anidoc.domain.user.pet.controller;

import com.petner.anidoc.domain.user.notification.entity.NotificationType;
import com.petner.anidoc.domain.user.notification.service.NotificationService;
import com.petner.anidoc.domain.user.notification.util.Ut;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notification/test")
public class TestVaccination {

    private final NotificationService notificationService;

    @PostMapping("/vaccination")
    public void vaccination(
            @RequestParam Long userId,
            @RequestParam Long petId,
            @RequestParam String petName,
            @RequestParam String date
    ){
        notificationService.notifyUser(
                userId,
                NotificationType.VACCINATION,
                petName + "의 예방접종 일정 임박",
                Ut.mapOf(
                        "petId", petId,
                        "petName", petName,
                        "date", date

                )
        );


    }

}
