package com.petner.anidoc.domain.chat.chatmessage.dto;

import com.petner.anidoc.domain.chat.chatmessage.entity.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessageResponseDto {
    private Long id;
    private Long roomId;
    private Long senderId;
    private String senderName;
    private String content;
    private Boolean isRead;
    private String createdAt;

    public static ChatMessageResponseDto fromEntity(ChatMessage chatMessage) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return ChatMessageResponseDto.builder()
                .id(chatMessage.getId())
                .roomId(chatMessage.getChatRoom().getId())
                .senderId(chatMessage.getSender().getId())
                .senderName(chatMessage.getSender().getName())
                .content(chatMessage.getContent())
                .isRead(chatMessage.getIsRead())
                .createdAt(chatMessage.getCreatedAt().format(formatter))
                .build();
    }
}
