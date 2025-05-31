package com.petner.anidoc.domain.notice.service;

import com.petner.anidoc.domain.notice.dto.NoticeRequestDto;
import com.petner.anidoc.domain.notice.dto.NoticeResponseDto;
import com.petner.anidoc.domain.notice.entity.Notice;
import com.petner.anidoc.domain.notice.repository.NoticeRepository;
import com.petner.anidoc.domain.user.notification.dto.NoticeNotificationDto;
import com.petner.anidoc.domain.user.notification.entity.NotificationType;
import com.petner.anidoc.domain.user.notification.service.NotificationService;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.nio.file.AccessDeniedException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    //공지사항 등록
    @Transactional
    public NoticeResponseDto createNotice(NoticeRequestDto noticeRequestDto, User user) throws AccessDeniedException {
        if(!user.getRole().equals(UserRole.ROLE_ADMIN)) throw new AccessDeniedException("관리자만 작성 가능합니다.");

        Notice notice = Notice.builder()
                .title(noticeRequestDto.getTitle())
                .content(noticeRequestDto.getContent())
                .writer(user)
                .build();

        Notice saved = noticeRepository.save(notice);

        // 전체 사용자 알림 트리거
        List<User> users = userRepository.findAll();
        for(User u : users){
            NoticeNotificationDto noticeNotificationDto = NoticeNotificationDto.builder()
                    .noticeId(saved.getId())
                    .title(saved.getTitle())
                    .content(notificationService.getSummary(saved.getContent()))
                    .writerName(user.getName())
                    .createdAt(saved.getCreatedAt())
                    .isRead(false)
                    .build();

            notificationService.notifyUser(
                    u.getId(),
                    NotificationType.NOTICE,
                    "공지사항: "+ noticeNotificationDto.getTitle(),
                    noticeNotificationDto
            );
        }

        return NoticeResponseDto.from(saved);
    }


    //공지사항 수정
    @Transactional
    public NoticeResponseDto updateNotice(Long noticeId, NoticeRequestDto noticeRequestDto, User user) throws AccessDeniedException {
        if(!user.getRole().equals(UserRole.ROLE_ADMIN)) throw new AccessDeniedException("관리자만 수정 가능합니다.");

        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(()-> new EntityNotFoundException("존재하지 않는 공지입니다."));

        notice.updateFromDto(noticeRequestDto);

    //수정 알림 트리거
        NoticeNotificationDto dto = NoticeNotificationDto.builder()
                .noticeId(notice.getId())
                .title(notice.getTitle())
                .content(notificationService.getSummary(notice.getContent()))
                .writerName(user.getName())
                .createdAt(notice.getCreatedAt())
                .isRead(false)
                .build();
        // 이벤트명 추가(선택), 프론트에 push
        notificationService.notifyAll(
                NotificationType.NOTICE,
                "[수정]공지사항: " + dto.getTitle(),
                dto
        );

        return NoticeResponseDto.from(notice);
    }


    //공지사항 삭제
    @Transactional
    public void deleteNotice(Long noticeId, User user) throws AccessDeniedException {
        if(!user.getRole().equals(UserRole.ROLE_ADMIN)) throw new AccessDeniedException("관리자만 삭제 가능합니다.");

        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(()-> new EntityNotFoundException("존재하지 않는 공지입니다."));

        noticeRepository.delete(notice);
    }



    @Transactional
    public NoticeResponseDto getNoticeById(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(()-> new EntityNotFoundException("존재하지 않는 공지입니다."));

                return NoticeResponseDto.from(notice);
    }

    // 공지사항 전체 조회 (페이징)
    @Transactional
    public Page<NoticeResponseDto> getAllNotices(Pageable pageable) {
        Page<Notice> noticePage = noticeRepository.findAllByOrderByCreatedAtDesc(pageable);
        return noticePage.map(NoticeResponseDto::from);
    }

    // 공지사항 검색 (페이징)
    @Transactional
    public Page<NoticeResponseDto> searchNotices(String title, Pageable pageable) {
        Page<Notice> searchPage = noticeRepository.findByTitleContainingOrderByCreatedAtDesc(title, pageable);
        return searchPage.map(NoticeResponseDto::from);
    }
}