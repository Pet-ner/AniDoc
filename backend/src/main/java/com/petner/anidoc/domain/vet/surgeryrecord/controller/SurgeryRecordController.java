package com.petner.anidoc.domain.vet.surgeryrecord.controller;

import com.petner.anidoc.domain.vet.surgeryrecord.dto.SurgeryRecordRequestDto;
import com.petner.anidoc.domain.vet.surgeryrecord.dto.SurgeryRecordResponseDto;
import com.petner.anidoc.domain.vet.surgeryrecord.service.SurgeryRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/medical-records/{medicalRecordId}/surgery")
@Tag(name="수술", description = "Surgery 관련 API")
public class SurgeryRecordController {

    private final SurgeryRecordService surgeryRecordService;

    @PostMapping
    @Operation(summary = "수술 기록 생성", description = "의료진이 진료기록에 수술 차트를 등록")
    public ResponseEntity<SurgeryRecordResponseDto> createSurgeryRecord(
            @PathVariable Long medicalRecordId,
            @RequestParam Long userId,
            @RequestBody SurgeryRecordRequestDto requestDto) throws AccessDeniedException {

        SurgeryRecordResponseDto response = surgeryRecordService.createSurgeryRecord(requestDto, userId, medicalRecordId);
        return ResponseEntity.ok(response);
    }
}
