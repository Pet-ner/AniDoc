package com.petner.anidoc.domain.user.notification.service;

import com.petner.anidoc.domain.user.notification.dto.PetInfoDto;
import com.petner.anidoc.domain.user.notification.dto.VaccinationNotificationDto;
import com.petner.anidoc.domain.user.notification.entity.Notification;
import com.petner.anidoc.domain.user.notification.entity.NotificationType;
import com.petner.anidoc.domain.user.notification.repository.NotificationRepository;
import com.petner.anidoc.domain.user.notification.util.VaccinationNotificationHelper;
import com.petner.anidoc.domain.user.notification.util.VaccinationScheduleManager;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class NotificationService {
    private final SseEmitters sseEmitters;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final VaccinationNotificationHelper vaccinationHelper;

    //특정 사용자에게 알림 저장 및 전송
    @Transactional
    public void notifyUser(Long userId, NotificationType type, String content, Object data){

        //알림 DB 저장
        Notification notification = Notification.builder()
                .user(User.builder().id(userId).build())
                .type(type)
                .content(content)
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        //알림 전송
        sseEmitters.noti(userId, type.name().toLowerCase(), data);

    }

    //전체 사용자에게 알림 저장 및 전송 (공지사항)
    @Transactional
    public void notifyAll(NotificationType type, String content, Object data){
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            notifyUser(user.getId(), type, content, data);
        }

    }

    //content 1문장 요약 함수
    public String getSummary(String content){
        if(content == null) return "";
        int idx = content.indexOf(".");
        if(idx > 0) {
            return content.substring(0, idx) + "...";
        }
        return content;
    }

    //전체 목록 조회
    @Transactional
    public Page<Notification> getNotifications(Long userId, Pageable pageable){
        return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable);
    }


    //알림 읽음 처리(1개)
    @Transactional
    public void markAsRead(Long notificationId){
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 알림입니다."));
        notification.markAsRead();
        notificationRepository.save(notification);

    }


    //알림 읽음 처리(전체)
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalse(userId);

        //읽음 처리
        notifications.forEach(Notification::markAsRead);

        notificationRepository.saveAll(notifications);

    }

    /**
     * 예방접종 알림
     */

    @Transactional
    public void sendVaccinationReminder(PetInfoDto petDto){
        // 예방접종 체크 및 발송
        if (vaccinationHelper.shouldSendVaccination(petDto)) {
            VaccinationNotificationDto dto =
                    vaccinationHelper.createVaccinationDto(petDto);
            String content = vaccinationHelper.createVaccinationMessage(petDto);

            if (dto != null && content != null) {
                notifyUser(petDto.getOwnerId(), NotificationType.VACCINATION, content, dto);
            }
        }

        // 심장사상충 체크 및 발송
        if(vaccinationHelper.shouldSendDiro(petDto)){
            String content = vaccinationHelper.createDiroMessage(petDto);
            notifyUser(petDto.getOwnerId(), NotificationType.VACCINATION, content, null);

        }
    }
}
