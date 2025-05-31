package com.petner.anidoc.domain.chat.chatroom.dto;

import com.petner.anidoc.domain.chat.chatmessage.entity.ChatMessage;
import com.petner.anidoc.domain.chat.chatroom.entity.ChatRoom;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatRoomResponseDto {
    private Long id;
    private Long reservationId;
    private String reservationDate;
    private String reservationTime;
    private Long userId;
    private String userName;
    private Long adminId;
    private String adminName;
    private int unreadCount;
    private String lastMessageContent;
    private String lastMessageTime;
    private String createdAt;

    public static ChatRoomResponseDto fromEntity(ChatRoom chatRoom) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // 마지막 메시지 정보
        String lastMessageContent = "";
        String lastMessageTime = "";
        if (!chatRoom.getMessages().isEmpty()) {
            ChatMessage lastMessage = chatRoom.getMessages().get(chatRoom.getMessages().size() - 1);
            lastMessageContent = lastMessage.getContent();
            lastMessageTime = lastMessage.getCreatedAt().format(formatter);
        }

        return ChatRoomResponseDto.builder()
                .id(chatRoom.getId())
                .reservationId(chatRoom.getReservation().getId())
                .reservationDate(chatRoom.getReservation().getReservationDate().toString())
                .reservationTime(chatRoom.getReservation().getReservationTime().toString())
                .userId(chatRoom.getUser().getId())
                .userName(chatRoom.getUser().getName())
                .adminId(chatRoom.getAdmin().getId())
                .adminName(chatRoom.getAdmin().getName())
                .unreadCount(0)  // 별도 계산 필요
                .lastMessageContent(lastMessageContent)
                .lastMessageTime(lastMessageTime)
                .createdAt(chatRoom.getCreatedAt().format(formatter))
                .build();
    }
}
