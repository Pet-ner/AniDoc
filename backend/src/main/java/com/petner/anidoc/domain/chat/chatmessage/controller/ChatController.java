package com.petner.anidoc.domain.chat.chatmessage.controller;

import com.petner.anidoc.domain.chat.chatmessage.dto.ChatMessageRequestDto;
import com.petner.anidoc.domain.chat.chatmessage.dto.ChatMessageResponseDto;
import com.petner.anidoc.domain.chat.chatmessage.dto.ReadStatusDto;
import com.petner.anidoc.domain.chat.chatmessage.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@MessageMapping("/chat")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    // 프론트엔드에서 /pub/chat/message 로 메시지를 보내면 처리
    @MessageMapping("/message")
    public void sendMessage(@Payload ChatMessageRequestDto messageDto) {
        // 메시지 저장
        ChatMessageResponseDto savedMessage = chatMessageService.saveMessage(messageDto);

        // 저장된 메시지를 해당 채팅방 구독자들에게 브로드캐스트
        messagingTemplate.convertAndSend("/sub/chat/room/" + messageDto.getRoomId(), savedMessage);
    }

    // 읽음 처리
    @MessageMapping("/read")
    public void markAsRead(@Payload ReadStatusDto readStatusDto) {
        chatMessageService.markMessagesAsRead(readStatusDto.getRoomId(), readStatusDto.getUserId());

        // 읽음 상태 변경을 알림
        messagingTemplate.convertAndSend("/sub/chat/room/" + readStatusDto.getRoomId() + "/read", readStatusDto);
    }

}