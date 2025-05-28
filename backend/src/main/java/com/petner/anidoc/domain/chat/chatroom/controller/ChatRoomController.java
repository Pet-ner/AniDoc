package com.petner.anidoc.domain.chat.chatroom.controller;

import com.petner.anidoc.domain.chat.chatmessage.dto.ChatMessagePageResponseDto;
import com.petner.anidoc.domain.chat.chatmessage.dto.ChatMessageResponseDto;
import com.petner.anidoc.domain.chat.chatmessage.service.ChatMessageService;
import com.petner.anidoc.domain.chat.chatroom.dto.ChatRoomRequestDto;
import com.petner.anidoc.domain.chat.chatroom.dto.ChatRoomResponseDto;
import com.petner.anidoc.domain.chat.chatroom.service.ChatRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat/rooms")
@Tag(name = "채팅", description = "Chat 관련 API")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;

    @Operation(summary = "채팅방 생성/조회", description = "예약 ID로 채팅방을 생성하거나 이미 존재하면 조회합니다.")
    @PostMapping
    public ResponseEntity<ChatRoomResponseDto> createOrGetChatRoom(@RequestBody ChatRoomRequestDto requestDto) {
        return new ResponseEntity<>(chatRoomService.createOrGetChatRoom(requestDto), HttpStatus.CREATED);
    }

    @Operation(summary = "유저 채팅방 목록 조회", description = "유저 ID로 채팅방 목록을 조회합니다.")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ChatRoomResponseDto>> getUserChatRooms(@PathVariable Long userId) {
        return ResponseEntity.ok(chatRoomService.getUserChatRooms(userId));
    }

    @Operation(summary = "채팅방 상세 조회", description = "채팅방 ID로 채팅방 상세 정보를 조회합니다.")
    @GetMapping("/{roomId}")
    public ResponseEntity<ChatRoomResponseDto> getChatRoom(
            @PathVariable Long roomId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(chatRoomService.getChatRoom(roomId, userId));
    }

    @Operation(summary = "채팅방 메시지 목록 조회", description = "채팅방 ID로 메시지 목록을 조회합니다.")
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<ChatMessageResponseDto>> getChatMessages(@PathVariable Long roomId) {
        return ResponseEntity.ok(chatMessageService.getChatMessages(roomId));
    }

    @Operation(summary = "채팅방 메시지 페이지 조회", description = "채팅방 ID로 메시지를 페이지로 조회합니다.")
    @GetMapping("/{roomId}/messages/page")
    public ResponseEntity<ChatMessagePageResponseDto> getChatMessagesPage(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(chatMessageService.getLatestChatMessages(roomId, page));
    }

    @Operation(summary = "이전 메시지 페이지 조회", description = "특정 메시지 이전의 메시지들을 조회합니다.")
    @GetMapping("/{roomId}/messages/prev")
    public ResponseEntity<ChatMessagePageResponseDto> getPreviousMessages(
            @PathVariable Long roomId,
            @RequestParam Long lastMessageId,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(chatMessageService.getPreviousChatMessages(roomId, lastMessageId, page));
    }

    @Operation(summary = "메시지 읽음 처리", description = "채팅방의 메시지를 읽음 처리합니다.")
    @PostMapping("/{roomId}/read")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable Long roomId,
            @RequestParam Long userId) {
        chatMessageService.markMessagesAsRead(roomId, userId);
        return ResponseEntity.ok().build();
    }
}