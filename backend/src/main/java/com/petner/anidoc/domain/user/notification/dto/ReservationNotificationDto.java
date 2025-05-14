package com.petner.anidoc.domain.user.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationNotificationDto {

    private Long reservationId;
    private String userName;
    private String petName;
    private String dateTime;
    private String createdAt;
    private String hospitalName;

}
