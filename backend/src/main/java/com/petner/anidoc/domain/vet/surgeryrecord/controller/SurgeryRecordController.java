package com.petner.anidoc.domain.vet.surgeryrecord.controller;

import com.petner.anidoc.domain.vet.checkuprecord.dto.CheckupRecordRequestDto;
import com.petner.anidoc.domain.vet.checkuprecord.dto.CheckupRecordResponseDto;
import com.petner.anidoc.domain.vet.surgeryrecord.dto.SurgeryRecordRequestDto;
import com.petner.anidoc.domain.vet.surgeryrecord.dto.SurgeryRecordResponseDto;
import com.petner.anidoc.domain.vet.surgeryrecord.service.SurgeryRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

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

    @GetMapping
    @Operation(summary = "진료 기록에 대한 수술 기록 조회", description = "의료진이 진료기록에 수술 기록을 조회")
    public ResponseEntity<SurgeryRecordResponseDto> getSurgeryRecord(
            @RequestParam Long userId,
            @PathVariable Long medicalRecordId
    ) {
        SurgeryRecordResponseDto record = surgeryRecordService.getSurgeryRecord(userId, medicalRecordId);
        return ResponseEntity.ok(record);
    }

    @PutMapping("/{surgeryRecordId}")
    @Operation(summary = "수술 기록 수정", description = "의료진이 진료기록에 수술 기록을 수정")
    public ResponseEntity<SurgeryRecordResponseDto> updateSurgery(
            @RequestBody SurgeryRecordRequestDto requestDto,
            @RequestParam Long userId,
            @PathVariable Long medicalRecordId,
            @PathVariable Long surgeryRecordId
    ) throws AccessDeniedException {
        SurgeryRecordResponseDto updated = surgeryRecordService.updateSurgeryRecord(requestDto, userId, medicalRecordId, surgeryRecordId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{surgeryRecordId}")
    @Operation(summary = "수술 기록 삭제", description = "의료진이 진료기록에 수술 기록을 삭제")
    public ResponseEntity<Void> deleteSurgeryRecord(
            @RequestParam Long userId,
            @PathVariable Long medicalRecordId,
            @PathVariable Long surgeryRecordId
    ) throws AccessDeniedException {
        surgeryRecordService.deleteSurgeryRecord(userId, medicalRecordId, surgeryRecordId);
        return ResponseEntity.noContent().build();
    }
}
