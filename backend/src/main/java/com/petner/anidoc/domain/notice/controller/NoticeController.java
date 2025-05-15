package com.petner.anidoc.domain.notice.controller;

import com.petner.anidoc.domain.notice.dto.NoticeRequestDto;
import com.petner.anidoc.domain.notice.dto.NoticeResponseDto;
import com.petner.anidoc.domain.notice.service.NoticeService;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notices")
@Tag(name = "공지사항", description = "공지사항 CRUD API")
public class NoticeController {

    private final NoticeService noticeService;
    private final UserRepository userRepository;

   //로그인 기능 반영 후 @RequestParam Long userId)는 인증관련으로 교체

    //공지사항 전체 조회
    @Operation(summary = "공지사항 전체 조회")
    @GetMapping
    public List<NoticeResponseDto> getAllNotices() {
        return noticeService.getAllNotices();
    }

    //공지사항 단건 상세조회
    @Operation(summary = "공지사항 상세 조회", description = "noticeId로 상세보기")
    @GetMapping("/{noticeId}")
    public NoticeResponseDto getNoticeById(@PathVariable Long noticeId) {
        return noticeService.getNoticeById(noticeId);
    }

    //공지사항 작성
    @Operation(summary = "공지사항 생성", description = "제목, 내용(작성자는 고정)")
    @PostMapping
    public NoticeResponseDto createNotice(@RequestBody NoticeRequestDto noticeRequestDto,
                                          @RequestParam Long userId) throws AccessDeniedException {

        //테스트용
        User user = userRepository.findById(userId)
                .orElseThrow(()->new EntityNotFoundException("존재하지 않는 사용자"));

        return noticeService.createNotice(noticeRequestDto, user);
    }

    //공지사항 수정
    @Operation(summary = "공지사항 수정", description = "제목, 내용")
    @PutMapping("/{noticeId}")
    public NoticeResponseDto updateNotice(@PathVariable Long noticeId,
                                          @RequestBody NoticeRequestDto noticeRequestDto,
                                          @RequestParam Long userId) throws AccessDeniedException {

        //테스트용
        User user = userRepository.findById(userId)
                .orElseThrow(()->new EntityNotFoundException("존재하지 않는 사용자"));

        return noticeService.updateNotice(noticeId, noticeRequestDto, user);
    }

    //공지사항 삭제
    @Operation(summary = "공지사항 삭제", description = "관리자만 삭제가능")
    @DeleteMapping("/{noticeId}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long noticeId,
                                             @RequestParam Long userId) throws AccessDeniedException {

        //테스트용
        User user = userRepository.findById(userId)
                .orElseThrow(()->new EntityNotFoundException("존재하지 않는 사용자"));

        noticeService.deleteNotice(noticeId, user);
        return ResponseEntity.noContent().build();
    }

}
