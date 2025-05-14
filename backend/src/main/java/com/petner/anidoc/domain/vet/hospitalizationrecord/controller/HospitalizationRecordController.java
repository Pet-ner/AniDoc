package com.petner.anidoc.domain.vet.hospitalizationrecord.controller;

import com.petner.anidoc.domain.vet.hospitalizationrecord.dto.HospitalizationRecordRequestDto;
import com.petner.anidoc.domain.vet.hospitalizationrecord.dto.HospitalizationRecordResponseDto;
import com.petner.anidoc.domain.vet.hospitalizationrecord.service.HospitalizationRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/medical-records/{medicalRecordId}/hospitalization")
@Tag(name="입원", description = "Hospitalization 관련 API")
public class HospitalizationRecordController {
    private final HospitalizationRecordService hospitalizationRecordService;

    @PostMapping
    @Operation(summary = "입원 기록 생성", description = "의료진이 진료기록에 입원 차트를 등록")
    public ResponseEntity<HospitalizationRecordResponseDto> createHospitalizationRecord(
            @PathVariable Long medicalRecordId,
            @RequestParam Long userId,
            @RequestBody HospitalizationRecordRequestDto requestDto) throws AccessDeniedException {
        HospitalizationRecordResponseDto response = hospitalizationRecordService.createHospitalizationRecord(requestDto, userId, medicalRecordId);
        return ResponseEntity.ok(response);
    }
}
