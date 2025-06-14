package com.petner.anidoc.domain.chat.chatmessage.repository;

import com.petner.anidoc.domain.chat.chatmessage.entity.ChatMessage;
import com.petner.anidoc.domain.chat.chatroom.entity.ChatRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomOrderByCreatedAtAsc(ChatRoom chatRoom);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.chatRoom.id = :roomId AND cm.isRead = false AND cm.sender.id != :userId")
    int countUnreadMessagesByRoomAndUser(@Param("roomId") Long roomId, @Param("userId") Long userId);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom.id = :roomId AND cm.isRead = false AND cm.sender.id != :userId")
    List<ChatMessage> findUnreadMessagesByRoomAndUser(@Param("roomId") Long roomId, @Param("userId") Long userId);

    // 최신 메시지부터 페이지로 조회
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom.id = :roomId ORDER BY cm.createdAt DESC")
    Page<ChatMessage> findByChatRoomIdOrderByCreatedAtDesc(@Param("roomId") Long roomId, Pageable pageable);

    // 특정 메시지 ID 이후의 메시지들 조회
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom.id = :roomId AND cm.id < :lastMessageId ORDER BY cm.createdAt DESC")
    Page<ChatMessage> findByChatRoomIdAndIdLessThanOrderByCreatedAtDesc(
            @Param("roomId") Long roomId,
            @Param("lastMessageId") Long lastMessageId,
            Pageable pageable
    );
}
