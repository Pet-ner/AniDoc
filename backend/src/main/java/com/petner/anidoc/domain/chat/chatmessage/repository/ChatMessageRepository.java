package com.petner.anidoc.domain.chat.chatmessage.repository;

import com.petner.anidoc.domain.chat.chatmessage.entity.ChatMessage;
import com.petner.anidoc.domain.chat.chatroom.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomOrderByCreatedAtAsc(ChatRoom chatRoom);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.chatRoom.id = :roomId AND cm.isRead = false AND cm.sender.id != :userId")
    int countUnreadMessagesByRoomAndUser(@Param("roomId") Long roomId, @Param("userId") Long userId);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom.id = :roomId AND cm.isRead = false AND cm.sender.id != :userId")
    List<ChatMessage> findUnreadMessagesByRoomAndUser(@Param("roomId") Long roomId, @Param("userId") Long userId);
}
