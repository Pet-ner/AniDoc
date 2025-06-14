package com.petner.anidoc.domain.user.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaccinationNotificationDto {
    private Long vaccinationId;
    private Long petId;
    private String petName;
    private String vaccineName;
    private String nextDueDate;
    private String vaccinationDate;

    private String petType;
    private Integer round;
    private String scheduleWeeks;
    private String type;
    private Boolean isRead;
    private LocalDateTime createdAt;

}
