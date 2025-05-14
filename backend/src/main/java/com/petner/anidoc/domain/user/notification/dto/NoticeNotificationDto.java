package com.petner.anidoc.domain.user.notification.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeNotificationDto {

    private Long noticeId;
    private String title;
    private String writerName;
    private LocalDate createdAt;

}
