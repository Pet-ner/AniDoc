package com.petner.anidoc.domain.notice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeRequestDto {

    private String title;
    private String content;

}
