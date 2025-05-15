package com.petner.anidoc.domain.user.notification.controller;

import com.petner.anidoc.domain.user.notification.dto.NoticeNotificationDto;
import com.petner.anidoc.domain.user.notification.dto.ReservationNotificationDto;
import com.petner.anidoc.domain.user.notification.dto.VaccinationNotificationDto;
import com.petner.anidoc.domain.user.notification.entity.NotificationType;
import com.petner.anidoc.domain.user.notification.service.NotificationService;
import com.petner.anidoc.domain.user.notification.service.SseEmitters;
import com.petner.anidoc.domain.user.notification.util.Ut;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
@Tag(name = "알림", description = "notification 관련 API")
public class NotificationSseController {
    // SSE 연결들을 관리하는 컴포넌트
    private final SseEmitters sseEmitters;
    //테스트를 위한 service
    private final NotificationService notificationService;

    // 클라이언트의 SSE 연결 요청을 처리하는 엔드포인트
    // /sse/connect로 GET 요청이 오면 SSE 스트림을 생성
    @Operation(summary = "SSE 알림 API", description = "알림이 생성됩니다.")
    @GetMapping(value = "/connect", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> connect(@RequestParam Long userId) {
        // 새로운 SSE 연결 생성 (타임아웃 1시간=60L * 60 * 1000, 기본값 30초)
        SseEmitter emitter = new SseEmitter();


        // 생성된 emitter를 컬렉션에 추가하여 관리
        sseEmitters.add(userId, emitter);

        try {
            // 연결된 클라이언트에게 초기 연결 성공 메시지 전송
            emitter.send(SseEmitter.event()
                    .name("connect")    // 이벤트 이름을 "connect"로 지정
                    .data("connected!")); // 전송할 데이터
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return ResponseEntity.ok(emitter);
    }

    //테스트 코드
    //예방접종 알림 테스트
    @PostMapping("/vaccination")
    @Operation(summary = "예방접종 알림 테스트", description = "dto 사용해 전송")
    public void vaccination(
            @RequestParam Long userId){
        VaccinationNotificationDto dto = VaccinationNotificationDto.builder()
                .vaccinationId(1L)
                .petId(101L)
                .petName("냥냥")
                .vaccineName("감기약")
                .nextDueDate("2025-05-13 17:00")
                .vaccinationDate("2025-05-13 19:00")
                .build();

        notificationService.notifyUser(
                userId,
                NotificationType.VACCINATION,
                "두번째 예방접종 알림 테스트 입니다.",
                dto
        );

    }


    //공지사항 알림(전체) 테스트

    @PostMapping("/test/notice")
    @Operation(summary = "공지사항 전체 알림 테스트", description = "dto 사용해 전송")
    public void testNotice() {
        NoticeNotificationDto dto = NoticeNotificationDto.builder()
                .noticeId(100L)
                .title("시스템 점검 안내")
                .writerName("관리자")
                .createdAt(LocalDateTime.now())
                .build();

        notificationService.notifyAll(
                NotificationType.NOTICE,
                "두번째 최종 전체 공지사항 알림입니다.",
                dto
        );
    }

    @PostMapping("/test/reservation")
    @Operation(summary = "개인 진료예약 알림 테스트", description = "dto 사용해 전송")
    public void testReservation(@RequestParam Long userId) {
        ReservationNotificationDto dto = new ReservationNotificationDto(
                200L,
                "홍길동",
                "초코",
                "2024-07-01 10:00",
                "2024-06-15 09:00",
                "AniDoc"
        );

        notificationService.notifyUser(
                userId,
                NotificationType.RESERVATION,
                "두번째 진료 예약 알림입니다.",
                dto
        );
    }

}
