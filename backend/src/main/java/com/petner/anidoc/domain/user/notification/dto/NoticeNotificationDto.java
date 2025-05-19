package com.petner.anidoc.domain.user.notification.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeNotificationDto {

    private Long noticeId;
    private String title;
    private String content;
    private String writerName;
    private LocalDateTime createdAt;
    private Boolean isRead;

}
