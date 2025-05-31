package com.petner.anidoc.domain.chat.chatroom.service;

import com.petner.anidoc.domain.chat.chatmessage.repository.ChatMessageRepository;
import com.petner.anidoc.domain.chat.chatroom.dto.ChatRoomRequestDto;
import com.petner.anidoc.domain.chat.chatroom.dto.ChatRoomResponseDto;
import com.petner.anidoc.domain.chat.chatroom.entity.ChatRoom;
import com.petner.anidoc.domain.chat.chatroom.repository.ChatRoomRepository;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import com.petner.anidoc.domain.vet.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;

    // 채팅방 생성 또는 조회
    @Transactional
    public ChatRoomResponseDto createOrGetChatRoom(ChatRoomRequestDto requestDto) {
        Reservation reservation = reservationRepository.findById(requestDto.getReservationId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));

        User user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 이미 존재하는 채팅방인지 확인
        ChatRoom chatRoom = chatRoomRepository.findByReservation(reservation)
                .orElseGet(() -> {
                    // 관리자 계정 찾기
                    User admin = userRepository.findByRole(UserRole.ROLE_ADMIN)
                            .stream()
                            .findFirst()
                            .orElseThrow(() -> new IllegalArgumentException("관리자가 존재하지 않습니다."));

                    // 새 채팅방 생성
                    return chatRoomRepository.save(ChatRoom.builder()
                            .reservation(reservation)
                            .user(reservation.getUser())
                            .admin(admin)
                            .build());
                });

        ChatRoomResponseDto responseDto = ChatRoomResponseDto.fromEntity(chatRoom);

        // 안 읽은 메시지 수 설정
        int unreadCount = chatMessageRepository.countUnreadMessagesByRoomAndUser(chatRoom.getId(), user.getId());

        return ChatRoomResponseDto.builder()
                .id(responseDto.getId())
                .reservationId(responseDto.getReservationId())
                .reservationDate(responseDto.getReservationDate())
                .reservationTime(responseDto.getReservationTime())
                .userId(responseDto.getUserId())
                .userName(responseDto.getUserName())
                .adminId(responseDto.getAdminId())
                .adminName(responseDto.getAdminName())
                .unreadCount(unreadCount)
                .lastMessageContent(responseDto.getLastMessageContent())
                .lastMessageTime(responseDto.getLastMessageTime())
                .createdAt(responseDto.getCreatedAt())
                .build();
    }

    // 유저 채팅방 목록 조회
    public List<ChatRoomResponseDto> getUserChatRooms(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        List<ChatRoom> chatRooms;

        // 관리자인 경우 모든 채팅방 조회, 일반 사용자는 본인 채팅방만 조회
        if (user.isAdmin()) {
            chatRooms = chatRoomRepository.findByAdminOrderByCreatedAtDesc(user);
        } else {
            chatRooms = chatRoomRepository.findByUserOrderByCreatedAtDesc(user);
        }

        return chatRooms.stream()
                .map(chatRoom -> {
                    ChatRoomResponseDto dto = ChatRoomResponseDto.fromEntity(chatRoom);
                    int unreadCount = chatMessageRepository.countUnreadMessagesByRoomAndUser(chatRoom.getId(), userId);

                    return ChatRoomResponseDto.builder()
                            .id(dto.getId())
                            .reservationId(dto.getReservationId())
                            .reservationDate(dto.getReservationDate())
                            .reservationTime(dto.getReservationTime())
                            .userId(dto.getUserId())
                            .userName(dto.getUserName())
                            .adminId(dto.getAdminId())
                            .adminName(dto.getAdminName())
                            .unreadCount(unreadCount)
                            .lastMessageContent(dto.getLastMessageContent())
                            .lastMessageTime(dto.getLastMessageTime())
                            .createdAt(dto.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // 채팅방 상세 조회
    public ChatRoomResponseDto getChatRoom(Long roomId, Long userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방입니다."));

        ChatRoomResponseDto dto = ChatRoomResponseDto.fromEntity(chatRoom);
        int unreadCount = chatMessageRepository.countUnreadMessagesByRoomAndUser(chatRoom.getId(), userId);

        return ChatRoomResponseDto.builder()
                .id(dto.getId())
                .reservationId(dto.getReservationId())
                .reservationDate(dto.getReservationDate())
                .reservationTime(dto.getReservationTime())
                .userId(dto.getUserId())
                .userName(dto.getUserName())
                .adminId(dto.getAdminId())
                .adminName(dto.getAdminName())
                .unreadCount(unreadCount)
                .lastMessageContent(dto.getLastMessageContent())
                .lastMessageTime(dto.getLastMessageTime())
                .createdAt(dto.getCreatedAt())
                .build();
    }
}