package com.petner.anidoc.domain.vet.checkup.controller;

import com.petner.anidoc.domain.vet.checkup.dto.CheckupRequestDto;
import com.petner.anidoc.domain.vet.checkup.dto.CheckupResponseDto;
import com.petner.anidoc.domain.vet.checkup.service.CheckupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/medical-records/{medicalRecordId}/checkup")
@Tag(name="검사", description = "Check Up 관련 API")
public class CheckupController {

    private final CheckupService checkupService;

    @PostMapping
    @Operation(summary = "검사 결과 생성", description = "의료진이 진료기록에 검사 결과를 등록")
    public ResponseEntity<CheckupResponseDto> createCheckupRecord(
            @PathVariable Long medicalRecordId,
            @RequestParam Long userId,
            @RequestBody CheckupRequestDto requestDto) throws AccessDeniedException {

        CheckupResponseDto response = checkupService.createCheckupRecord(requestDto, userId, medicalRecordId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "진료 기록에 대한 모든 검사 기록 조회", description = "의료진이 진료기록에 검사 결과를 조회")
    public ResponseEntity<List<CheckupResponseDto>> getCheckupRecord(
            @RequestParam Long userId,
            @PathVariable Long medicalRecordId
    ) {
        List<CheckupResponseDto> records = checkupService.getCheckupRecord(userId, medicalRecordId);
        return ResponseEntity.ok(records);
    }

    @PutMapping("/{checkupId}")
    @Operation(summary = "검사 결과 수정", description = "의료진이 진료기록에 검사 결과를 수정")
    public ResponseEntity<CheckupResponseDto> updateCheckup(
            @RequestBody CheckupRequestDto requestDto,
            @RequestParam Long userId,
            @PathVariable Long medicalRecordId,
            @PathVariable("checkupId") Long checkupRecordId
    ) throws AccessDeniedException {
        CheckupResponseDto updated = checkupService.updateCheckupRecord(requestDto, userId, medicalRecordId, checkupRecordId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{checkupId}")
    @Operation(summary = "검사 결과 삭제", description = "의료진이 진료기록에 검사 결과를 삭제")
    public ResponseEntity<Void> deleteCheckup(
            @RequestParam Long userId,
            @PathVariable Long medicalRecordId,
            @PathVariable("checkupId") Long checkupRecordId
    ) throws AccessDeniedException {
        checkupService.deleteCheckupRecord(userId, medicalRecordId, checkupRecordId);
        return ResponseEntity.noContent().build();
    }

}
