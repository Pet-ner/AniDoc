package com.petner.anidoc.domain.user.notification.util;

import com.petner.anidoc.domain.user.notification.dto.ReservationNotificationDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class NotificationMessageUtil {

    //예약 날짜 포맷
    public static String getFormattedReservationDateTime(LocalDate reservationDate, LocalTime reservationTime) {
        if(reservationDate == null || reservationTime == null) return "";
        //날짜 형식
        LocalDateTime dateTime = LocalDateTime.of(reservationDate, reservationTime);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yy년 M월 d일 HH시 mm분");
        return dateTime.format(formatter);
    }

    // 예약 생성 메시지
    public static String buildReservationCreated(ReservationNotificationDto dto) {
        return String.format("%s님의 %s 진료예약이 등록되었습니다. 예약일시: %s",
                dto.getUserName(),
                dto.getPetName(),
                getFormattedReservationDateTime(dto.getReservationDate(), dto.getReservationTime())
        );
    }

    //예약 확정 메시지
    public static String buildReservationStatusApproved(ReservationNotificationDto dto){
        return String.format("%s님의 %s 진료예약이 확정되었습니다. 예약일시: %s",
            dto.getUserName(),
            dto.getPetName(),
            getFormattedReservationDateTime(dto.getReservationDate(), dto.getReservationTime())
        );
    }

    //예약 거절 메시지
    public static String buildReservationStatusRejected(ReservationNotificationDto dto){
        return String.format("%s님의 %s 진료예약이 거절되었습니다. 예약일시: %s",
                dto.getUserName(),
                dto.getPetName(),
                getFormattedReservationDateTime(dto.getReservationDate(), dto.getReservationTime())
        );
    }

    //예약 취소 메시지
    public static String buildReservationCancelled(ReservationNotificationDto dto){
        return String.format("%s님의 %s 진료예약이 취소되었습니다. 예약일시: %s",
                dto.getUserName(),
                dto.getPetName(),
                getFormattedReservationDateTime(dto.getReservationDate(), dto.getReservationTime())
        );
    }

    //예약 수정 메시지
    public static String buildReservationUpdated(ReservationNotificationDto dto){
        return String.format("%s님의 %s 진료예약이 변경되었습니다. 예약일시: %s",
                dto.getUserName(),
                dto.getPetName(),
                getFormattedReservationDateTime(dto.getReservationDate(), dto.getReservationTime())
        );
    }

}
