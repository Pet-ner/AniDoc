package com.petner.anidoc.domain.chat.chatmessage.controller;

import com.petner.anidoc.domain.chat.chatmessage.dto.ChatMessageRequestDto;
import com.petner.anidoc.domain.chat.chatmessage.dto.ChatMessageResponseDto;
import com.petner.anidoc.domain.chat.chatmessage.dto.ReadStatusDto;
import com.petner.anidoc.domain.chat.chatmessage.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
@MessageMapping("/chat")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    // 프론트엔드에서 /pub/chat/message 로 메시지를 보내면 처리
    @MessageMapping("/message")
    public void sendMessage(@Payload ChatMessageRequestDto messageDto, SimpMessageHeaderAccessor headerAccessor) {
        try {
            // 세션에서 인증된 유저 정보 확인
            Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");

            if (userId == null) {
                log.warn("메시지 전송 실패: 인증되지 않은 유저");
                return;
            }

            // 메시지 전송자와 인증된 유저가 일치하는지 확인
            if (!userId.equals(messageDto.getSenderId())) {
                log.warn("메시지 전송 실패: 권한 없음 (인증 유저: {}, 요청 유저: {})", userId, messageDto.getSenderId());
                return;
            }

            // 메시지 저장
            ChatMessageResponseDto savedMessage = chatMessageService.saveMessage(messageDto);

            // 저장된 메시지를 해당 채팅방 구독자들에게 브로드캐스트
            messagingTemplate.convertAndSend("/sub/chat/room/" + messageDto.getRoomId(), savedMessage);
        } catch (Exception e) {
            log.error("메시지 전송 실패: ", e);
        }
    }

    // 읽음 처리
    @MessageMapping("/read")
    public void markAsRead(@Payload ReadStatusDto readStatusDto, SimpMessageHeaderAccessor headerAccessor) {
        try {
            // 세션에서 인증된 유저 정보 확인
            Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");

            if (userId == null) {
                log.warn("메시지 읽음 처리 실패: 인증되지 않은 유저");
                return;
            }

            // 요청자와 인증된 유저가 일치하는지 확인
            if (!userId.equals(readStatusDto.getUserId())) {
                log.warn("메시지 읽음 처리 실패: 권한 없음 (인증 유저: {}, 요청 유저: {})", userId, readStatusDto.getUserId());
                return;
            }

            chatMessageService.markMessagesAsRead(readStatusDto.getRoomId(), readStatusDto.getUserId());

            // 읽음 상태 변경을 알림
            messagingTemplate.convertAndSend("/sub/chat/room/" + readStatusDto.getRoomId() + "/read", readStatusDto);
        } catch (Exception e) {
            log.error("메시지 읽음 처리 실패: ", e);
        }
    }

}