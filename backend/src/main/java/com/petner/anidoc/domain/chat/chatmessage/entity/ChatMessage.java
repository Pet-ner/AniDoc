package com.petner.anidoc.domain.chat.chatmessage.entity;

import com.petner.anidoc.domain.chat.chatroom.entity.ChatRoom;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
@Table(name = "chat_messages")
public class ChatMessage extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_read")
    private Boolean isRead;

    public void markAsRead() {
        this.isRead = true;
    }
}
