package com.petner.anidoc.domain.chat.chatmessage.service;

import com.petner.anidoc.domain.chat.chatmessage.dto.ChatMessagePageResponseDto;
import com.petner.anidoc.domain.chat.chatmessage.dto.ChatMessageRequestDto;
import com.petner.anidoc.domain.chat.chatmessage.dto.ChatMessageResponseDto;
import com.petner.anidoc.domain.chat.chatmessage.entity.ChatMessage;
import com.petner.anidoc.domain.chat.chatmessage.repository.ChatMessageRepository;
import com.petner.anidoc.domain.chat.chatroom.entity.ChatRoom;
import com.petner.anidoc.domain.chat.chatroom.repository.ChatRoomRepository;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.global.exception.CustomException;
import com.petner.anidoc.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatMessageService {

    private static final int DEFAULT_PAGE_SIZE = 20; // 한 페이지당 메시지 수

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

    // 최신 메시지 페이지 조회 (첫 로드)
    public ChatMessagePageResponseDto getLatestChatMessages(Long roomId, int page) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, DEFAULT_PAGE_SIZE);
        Page<ChatMessage> messagePage = chatMessageRepository.findByChatRoomIdOrderByCreatedAtDesc(roomId, pageable);

        // 최신순으로 조회했으니 순서 뒤집어야 함 (프론트엔드 표시용)
        List<ChatMessageResponseDto> messages = messagePage.getContent()
                .stream()
                .sorted((m1, m2) -> m1.getCreatedAt().compareTo(m2.getCreatedAt()))
                .map(ChatMessageResponseDto::fromEntity)
                .collect(Collectors.toList());

        return ChatMessagePageResponseDto.builder()
                .messages(messages)
                .totalElements(messagePage.getTotalElements())
                .totalPages(messagePage.getTotalPages())
                .currentPage(page)
                .hasNext(messagePage.hasNext())
                .hasPrevious(messagePage.hasPrevious())
                .build();
    }

    public ChatMessagePageResponseDto getPreviousChatMessages(Long roomId, Long lastMessageId, int page) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, DEFAULT_PAGE_SIZE);
        Page<ChatMessage> messagePage = chatMessageRepository
                .findByChatRoomIdAndIdLessThanOrderByCreatedAtDesc(roomId, lastMessageId, pageable);

        // 최신순으로 조회했으니 순서 뒤집어야 함 (프론트엔드 표시용)
        List<ChatMessageResponseDto> messages = messagePage.getContent()
                .stream()
                .sorted((m1, m2) -> m1.getCreatedAt().compareTo(m2.getCreatedAt()))
                .map(ChatMessageResponseDto::fromEntity)
                .collect(Collectors.toList());

        return ChatMessagePageResponseDto.builder()
                .messages(messages)
                .totalElements(messagePage.getTotalElements())
                .totalPages(messagePage.getTotalPages())
                .currentPage(page)
                .hasNext(messagePage.hasNext())
                .hasPrevious(messagePage.hasPrevious())
                .build();
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
