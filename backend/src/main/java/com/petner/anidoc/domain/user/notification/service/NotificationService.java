package com.petner.anidoc.domain.user.notification.service;

import com.petner.anidoc.domain.user.notification.entity.Notification;
import com.petner.anidoc.domain.user.notification.entity.NotificationType;
import com.petner.anidoc.domain.user.notification.repository.NotificationRepository;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final SseEmitters sseEmitters;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

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

}
