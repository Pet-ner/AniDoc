package com.petner.anidoc.domain.chat.chatmessage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 읽음 처리용 DTO
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ReadStatusDto {
    private Long roomId;
    private Long userId;
}