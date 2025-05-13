package com.petner.anidoc.domain.vet.surgery.controller;

import com.petner.anidoc.domain.vet.surgery.dto.SurgeryRequestDto;
import com.petner.anidoc.domain.vet.surgery.dto.SurgeryResponseDto;
import com.petner.anidoc.domain.vet.surgery.service.SurgeryService;
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
public class SurgeryController {

    private final SurgeryService surgeryService;

    @PostMapping
    @Operation(summary = "수술 기록 생성", description = "의료진이 진료기록에 수술 차트를 등록")
    public ResponseEntity<SurgeryResponseDto> createSurgery(
            @PathVariable Long medicalRecordId,
            @RequestParam Long userId,
            @RequestBody SurgeryRequestDto requestDto) throws AccessDeniedException {

        SurgeryResponseDto response = surgeryService.createSurgery(requestDto, userId, medicalRecordId);
        return ResponseEntity.ok(response);
    }
}
