package com.petner.anidoc.domain.vet.checkuprecord.controller;

import com.petner.anidoc.domain.vet.checkuprecord.dto.CheckupRecordRequestDto;
import com.petner.anidoc.domain.vet.checkuprecord.dto.CheckupRecordResponseDto;
import com.petner.anidoc.domain.vet.checkuprecord.service.CheckupRecordService;
import com.petner.anidoc.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/medical-records/{medicalRecordId}/checkup")
@Tag(name="검사", description = "Check Up 관련 API")
public class CheckupRecordController {

    private final CheckupRecordService checkupRecordService;

    @PostMapping
    @Operation(summary = "검사 결과 생성", description = "의료진이 진료기록에 검사 결과를 등록")
    public ResponseEntity<CheckupRecordResponseDto> createCheckupRecord(
            @PathVariable Long medicalRecordId,
            @AuthenticationPrincipal SecurityUser user,
            @RequestBody CheckupRecordRequestDto requestDto) throws AccessDeniedException {

        Long userId = user.getId();
        CheckupRecordResponseDto response = checkupRecordService.createCheckupRecord(requestDto, userId, medicalRecordId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "진료 기록에 대한 모든 검사 기록 조회", description = "의료진이 진료기록에 검사 결과를 조회")
    public ResponseEntity<List<CheckupRecordResponseDto>> getCheckupRecord(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long medicalRecordId
    ) {
        Long userId = user.getId();
        List<CheckupRecordResponseDto> records = checkupRecordService.getCheckupRecord(userId, medicalRecordId);
        return ResponseEntity.ok(records);
    }

    @PutMapping("/{checkupRecordId}")
    @Operation(summary = "검사 결과 수정", description = "의료진이 진료기록에 검사 결과를 수정")
    public ResponseEntity<CheckupRecordResponseDto> updateCheckupRecord(
            @RequestBody CheckupRecordRequestDto requestDto,
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long medicalRecordId,
            @PathVariable Long checkupRecordId
    ) throws AccessDeniedException {
        Long userId = user.getId();
        CheckupRecordResponseDto updated = checkupRecordService.updateCheckupRecord(requestDto, userId, medicalRecordId, checkupRecordId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{checkupRecordId}")
    @Operation(summary = "검사 결과 삭제", description = "의료진이 진료기록에 검사 결과를 삭제")
    public ResponseEntity<Void> deleteCheckupRecord(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long medicalRecordId,
            @PathVariable Long checkupRecordId
    ) throws AccessDeniedException {
        Long userId = user.getId();
        checkupRecordService.deleteCheckupRecord(userId, medicalRecordId, checkupRecordId);
        return ResponseEntity.noContent().build();
    }

}
