package com.petner.anidoc.domain.notice.repository;

import com.petner.anidoc.domain.notice.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

}
