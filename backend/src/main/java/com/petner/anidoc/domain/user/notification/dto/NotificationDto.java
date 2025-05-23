package com.petner.anidoc.domain.user.notification.dto;

import com.petner.anidoc.domain.user.notification.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private Boolean isRead;
    private String type;

    public static NotificationDto from(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .content(notification.getContent())
                .createdAt(notification.getCreatedAt())
                .isRead(notification.getIsRead())
                .type(notification.getType().name())
                .build();
    }

}
