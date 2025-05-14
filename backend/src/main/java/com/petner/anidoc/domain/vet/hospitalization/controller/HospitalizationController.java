package com.petner.anidoc.domain.vet.hospitalization.controller;

import com.petner.anidoc.domain.vet.hospitalization.dto.HospitalizationRequestDto;
import com.petner.anidoc.domain.vet.hospitalization.dto.HospitalizationResponseDto;
import com.petner.anidoc.domain.vet.hospitalization.service.HospitalizationService;
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
public class HospitalizationController {
    private final HospitalizationService hospitalizationService;

    @PostMapping
    @Operation(summary = "입원 기록 생성", description = "의료진이 진료기록에 입원 차트를 등록")
    public ResponseEntity<HospitalizationResponseDto> createHospitalization(
            @PathVariable Long medicalRecordId,
            @RequestParam Long userId,
            @RequestBody HospitalizationRequestDto requestDto) throws AccessDeniedException {
        HospitalizationResponseDto response = hospitalizationService.createHospitalization(requestDto, userId, medicalRecordId);
        return ResponseEntity.ok(response);
    }
}
