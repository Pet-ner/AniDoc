package com.petner.anidoc.domain.notice.dto;

import com.petner.anidoc.domain.notice.entity.Notice;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeResponseDto {

    private Long id;
    private String title;
    private String content;
    private String writer;
    private String createdAt;
    private String updatedAt;

    public static NoticeResponseDto from(Notice notice){
        return NoticeResponseDto.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .writer(notice.getWriter().getName())
                .createdAt(notice.getCreatedAt() != null ? notice.getCreatedAt().toString() : null)
                .updatedAt(notice.getUpdatedAt() != null ? notice.getUpdatedAt().toString() : null)
                .build();
    }

}
