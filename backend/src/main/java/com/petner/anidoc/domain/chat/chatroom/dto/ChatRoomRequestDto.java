package com.petner.anidoc.domain.chat.chatroom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatRoomRequestDto {
    private Long reservationId;
    private Long userId;
}
