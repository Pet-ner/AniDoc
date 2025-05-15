package com.petner.anidoc.domain.chat.chatmessage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessageRequestDto {
    private Long roomId;
    private Long senderId;
    private String content;
}
