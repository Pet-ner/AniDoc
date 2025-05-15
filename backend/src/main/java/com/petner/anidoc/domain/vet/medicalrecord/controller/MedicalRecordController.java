package com.petner.anidoc.domain.vet.medicalrecord.controller;

import com.petner.anidoc.domain.vet.medicalrecord.dto.MedicalRecordRequestDto;
import com.petner.anidoc.domain.vet.medicalrecord.dto.MedicalRecordResponseDto;
import com.petner.anidoc.domain.vet.medicalrecord.service.MedicalRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.nio.file.attribute.UserPrincipal;

@RestController
@RequestMapping("api/medical-records")
@RequiredArgsConstructor
@Tag(name="진료기록", description = "MedicalRecord 관련 API")
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;

    @PostMapping
    @Operation(summary = "진료기록 생성", description = "예약 ID와 사용자 ID를 기반으로 진료기록을 생성")
    public ResponseEntity<MedicalRecordResponseDto> createMedicalRecord(
            @RequestBody MedicalRecordRequestDto dto,
            @RequestParam Long userId,
            @RequestParam Long reservationId/*,
            @AuthenticationPrincipal SecurityUser userDetails*/) throws AccessDeniedException {
        MedicalRecordResponseDto response = medicalRecordService.createMedicalRecord(dto,userId,reservationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{medicalRecordId}")
    @Operation(summary = "진료기록 단건 상세 조회", description = "사용자 ID와 진료기록 ID를 기반으로 진료기록을 조회")
    public ResponseEntity<MedicalRecordResponseDto> getMedicalRecord(
            @RequestParam Long userId,
            @PathVariable Long medicalRecordId){
        MedicalRecordResponseDto response = medicalRecordService.getMedicalRecord(userId, medicalRecordId);
        return ResponseEntity.ok(response);

    }

    @PutMapping("/{medicalRecordId}")
    @Operation(summary = "진료기록 수정", description = "사용자 ID와 진료기록 ID를 기반으로 진료기록을 수정")
    public ResponseEntity<MedicalRecordResponseDto> updateMedicalRecord(
            @RequestParam Long userId,
            @PathVariable Long medicalRecordId,
            @RequestBody MedicalRecordRequestDto medicalRecordRequestDto) throws AccessDeniedException {
        MedicalRecordResponseDto response = medicalRecordService.updateMedicalRecord(userId, medicalRecordId, medicalRecordRequestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{medicalRecordId}")
    @Operation(summary = "진료기록 삭제", description = "사용자 ID와 진료기록 ID를 기반으로 진료기록을 삭제(soft delete)")
    public ResponseEntity<Void> deleteMedicalRecord(
            @RequestParam Long userId,
            @PathVariable Long medicalRecordId) throws AccessDeniedException {
        medicalRecordService.deleteMedicalRecord(medicalRecordId,userId);
        return ResponseEntity.noContent().build();

    }




}
