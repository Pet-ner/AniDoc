package com.petner.anidoc.domain.chat.chatmessage.service;

import com.petner.anidoc.domain.chat.chatmessage.dto.ChatMessageRequestDto;
import com.petner.anidoc.domain.chat.chatmessage.dto.ChatMessageResponseDto;
import com.petner.anidoc.domain.chat.chatmessage.entity.ChatMessage;
import com.petner.anidoc.domain.chat.chatmessage.repository.ChatMessageRepository;
import com.petner.anidoc.domain.chat.chatroom.entity.ChatRoom;
import com.petner.anidoc.domain.chat.chatroom.repository.ChatRoomRepository;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    // 메시지 저장
    @Transactional
    public ChatMessageResponseDto saveMessage(ChatMessageRequestDto requestDto) {
        ChatRoom chatRoom = chatRoomRepository.findById(requestDto.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방입니다."));

        User sender = userRepository.findById(requestDto.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .content(requestDto.getContent())
                .isRead(false)
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        return ChatMessageResponseDto.fromEntity(savedMessage);
    }

    // 채팅방 메시지 목록 조회
    public List<ChatMessageResponseDto> getChatMessages(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방입니다."));

        List<ChatMessage> messages = chatMessageRepository.findByChatRoomOrderByCreatedAtAsc(chatRoom);

        return messages.stream()
                .map(ChatMessageResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 메시지 읽음 처리
    @Transactional
    public void markMessagesAsRead(Long roomId, Long userId) {
        List<ChatMessage> unreadMessages = chatMessageRepository.findUnreadMessagesByRoomAndUser(roomId, userId);

        for (ChatMessage message : unreadMessages) {
            message.markAsRead();
        }

        chatMessageRepository.saveAll(unreadMessages);
    }

    // 안 읽은 메시지 수 조회
    public int countUnreadMessages(Long roomId, Long userId) {
        return chatMessageRepository.countUnreadMessagesByRoomAndUser(roomId, userId);
    }

}
