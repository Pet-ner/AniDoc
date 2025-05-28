package com.petner.anidoc.domain.user.notification.controller;

import com.petner.anidoc.domain.user.notification.dto.NotificationDto;
import com.petner.anidoc.domain.user.notification.entity.Notification;
import com.petner.anidoc.domain.user.notification.service.NotificationService;
import com.petner.anidoc.domain.user.pet.repository.PetRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "알림", description = "notification 관련 API")
public class NotificationController {
    private final NotificationService notificationService;
    private final PetRepository petRepository;

    //알림 전체 목록
    @Operation(summary = "알림 목록 조회", description = "알림 내역을 확인합니다.")
    @GetMapping
    public Page<NotificationDto> getNotifications(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        Pageable pageable = PageRequest.of(page, size);
        return notificationService.getNotifications(userId, pageable)
                .map(NotificationDto::from);
    }

    //알림 읽음 처리(1개)
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId){
        notificationService.markAsRead(notificationId);
        return ResponseEntity.noContent().build();
    }

    //알림 읽음 처리(전체)
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestParam Long userId){
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }


}
