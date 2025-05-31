package com.petner.anidoc.domain.user.notification.repository;

import com.petner.anidoc.domain.user.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // 특정 사용자의 모든 알림 조회
    List<Notification> findByUserId(Long userId);

    // 특정 사용자의 읽지 않은 알림 조회
    List<Notification> findByUserIdAndIsReadFalse(Long userId);

    //읽지 않은 알림 개수 조회
    int countByUserIdAndIsReadFalse(Long userId);

    //페이징 처리
    Page<Notification> findAllByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

}
