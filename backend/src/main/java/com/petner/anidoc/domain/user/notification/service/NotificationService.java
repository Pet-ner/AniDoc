package com.petner.anidoc.domain.user.notification.service;

import com.petner.anidoc.domain.user.notification.dto.PetInfoDto;
import com.petner.anidoc.domain.user.notification.dto.VaccinationNotificationDto;
import com.petner.anidoc.domain.user.notification.entity.Notification;
import com.petner.anidoc.domain.user.notification.entity.NotificationType;
import com.petner.anidoc.domain.user.notification.repository.NotificationRepository;
import com.petner.anidoc.domain.user.notification.util.VaccinationNotificationHelper;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.reservation.repository.ReservationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final SseEmitters sseEmitters;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final VaccinationNotificationHelper vaccinationHelper;
    private final ReservationRepository reservationRepository;

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

        Notification savedNotification = notificationRepository.save(notification);

        //정보 포함 알림 전송
        Map<String, Object> sseData = new HashMap<>();
        sseData.put("id", savedNotification.getId());
        sseData.put("content", content);
        sseData.put("type", type.name());
        sseData.put("isRead", false);
        sseData.put("createdAt", savedNotification.getCreatedAt());
        if (data != null) {
            sseData.put("data", data);
        }

        sseEmitters.noti(userId, type.name().toLowerCase(), sseData);
    }

    //전체 사용자에게 알림 저장 및 전송 (공지사항)
    @Transactional
    public void notifyAll(NotificationType type, String content, Object data){
        try {
            // ⭐ 1단계: 모든 사용자에게 알림 저장 (토큰 상관없이)
            List<User> allUsers = userRepository.findAll();

            for (User user : allUsers) {
                try {
                    Notification notification = Notification.builder()
                            .user(user)
                            .type(type)
                            .content(content)
                            .isRead(false)
                            .build();
                    notificationRepository.save(notification);

                } catch (Exception e) {
                    log.error("사용자 {} 알림 저장 실패: {}", user.getId(), e.getMessage());
                }
            }

            // ⭐ 2단계: 로그인한 사용자에게만 실시간 SSE 전송
            List<User> activeUsers = allUsers.stream()
                    .filter(user -> user.getRefreshToken() != null)
                    .filter(user -> !user.getRefreshToken().isEmpty())
                    .collect(Collectors.toList());


            for (User activeUser : activeUsers) {
                try {
                    sseEmitters.noti(activeUser.getId(), type.name().toLowerCase(), data);

                } catch (Exception e) {
                    log.error("❌ 사용자 {} SSE 전송 실패: {}", activeUser.getId(), e.getMessage());
                }
            }


        // 2. 전역 이벤트 발생 (페이지 새로고침용)
            if (type == NotificationType.NOTICE) {
                sseEmitters.noti("notice-refresh", data);
            }

        } catch (Exception e) {
            log.error("notifyAll 처리 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("알림 처리 실패", e);
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
    // SseEmitters를 활용한 연결 관리
    public void addSseConnection(Long userId, SseEmitter emitter) {
        sseEmitters.add(userId, emitter);
    }

    // 연결 제거는 SseEmitters에서 자동 처리됨
    public void removeSseConnection(Long userId, SseEmitter emitter) {
        // SseEmitters의 콜백에서 자동 처리되므로 별도 구현 불필요
    }

    // 읽지 않은 알림 개수 조회
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}



