package com.petner.anidoc.domain.notice.controller;

import com.petner.anidoc.domain.notice.dto.NoticeRequestDto;
import com.petner.anidoc.domain.notice.dto.NoticeResponseDto;
import com.petner.anidoc.domain.notice.service.NoticeService;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notices")
@Slf4j
@Tag(name = "공지사항", description = "공지사항 CRUD API")
public class NoticeController {

    private final NoticeService noticeService;
    private final UserRepository userRepository;

    //컨트롤러 예외 처리 유틸 메서드
    private User getUserFromUserDetails(UserDetails userDetails){
        if(userDetails == null){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"로그인이 필요합니다.");
        }
        return  userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
    }

    //공지사항 전체 조회
    @Operation(summary = "공지사항 전체 조회")
    @GetMapping
    public Page<NoticeResponseDto> getAllNotices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
) {
    Pageable pageable = PageRequest.of(page, size);
    return noticeService.getAllNotices(pageable);
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
    public NoticeResponseDto createNotice(@Valid @RequestBody NoticeRequestDto noticeRequestDto,
                                          @AuthenticationPrincipal UserDetails currentUser) {
        log.info("=== POST /api/notices 요청 도달 ===");
        log.info("요청 데이터: {}", noticeRequestDto);

        User user = getUserFromUserDetails(currentUser);
        NoticeResponseDto result = noticeService.createNotice(noticeRequestDto, user);

        log.info("응답 데이터: {}", result);
        return result;
    }


    //공지사항 수정
    @Operation(summary = "공지사항 수정", description = "제목, 내용")
    @PutMapping("/{noticeId}")
    public NoticeResponseDto updateNotice(@PathVariable Long noticeId,
                                          @Valid @RequestBody NoticeRequestDto noticeRequestDto,
                                          @AuthenticationPrincipal UserDetails currentUser) {

        User user = getUserFromUserDetails(currentUser);

        return noticeService.updateNotice(noticeId, noticeRequestDto, user);
    }

    //공지사항 삭제
    @Operation(summary = "공지사항 삭제", description = "관리자만 삭제가능")
    @DeleteMapping("/{noticeId}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long noticeId,
                                             @AuthenticationPrincipal UserDetails currentUser) {

        User user = getUserFromUserDetails(currentUser);

        noticeService.deleteNotice(noticeId, user);
        return ResponseEntity.noContent().build();
    }
    
    //공지사항 검색
    @GetMapping("/search")
    public ResponseEntity<Page<NoticeResponseDto>> searchNotices(
            @RequestParam String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(noticeService.searchNotices(title, pageable));

    }
}