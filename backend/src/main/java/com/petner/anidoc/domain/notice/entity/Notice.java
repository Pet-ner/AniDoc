package com.petner.anidoc.domain.notice.entity;

import com.petner.anidoc.domain.notice.dto.NoticeRequestDto;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
@Table(name = "notices_board")
public class Notice extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writer_id", nullable = false)
    private User writer;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    public void updateFromDto(NoticeRequestDto noticeRequestDto) {
        this.title = noticeRequestDto.getTitle();
        this.content = noticeRequestDto.getContent();
    }

}
