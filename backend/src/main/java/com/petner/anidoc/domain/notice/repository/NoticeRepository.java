package com.petner.anidoc.domain.notice.repository;

import com.petner.anidoc.domain.notice.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {

    // 페이징 처리
    Page<Notice> findAllByOrderByCreatedAtDesc(Pageable pageable);


    //제목으로 검색
    Page<Notice> findByTitleContainingOrderByCreatedAtDesc(String title, Pageable pageable);

}