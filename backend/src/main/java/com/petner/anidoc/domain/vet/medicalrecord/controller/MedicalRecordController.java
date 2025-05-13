package com.petner.anidoc.domain.vet.medicalrecord.controller;

import com.petner.anidoc.domain.vet.medicalrecord.dto.MedicalRecordRequestDto;
import com.petner.anidoc.domain.vet.medicalrecord.dto.MedicalRecordResponseDto;
import com.petner.anidoc.domain.vet.medicalrecord.service.MedicalRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.Table;
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
    @Operation(summary = "진료기록 생성", description = "예약ID와 사용자 ID를 기반으로 진료기록을 생성")
    public ResponseEntity<MedicalRecordResponseDto> createMedicalRecord(
            @RequestBody MedicalRecordRequestDto dto,
            @RequestParam Long userId,
            @RequestParam Long reservationId/*,
            @AuthenticationPrincipal SecurityUser userDetails*/) throws AccessDeniedException {
        MedicalRecordResponseDto response = medicalRecordService.createMedicalRecord(dto,userId,reservationId);
        return ResponseEntity.ok(response);
    }
}
