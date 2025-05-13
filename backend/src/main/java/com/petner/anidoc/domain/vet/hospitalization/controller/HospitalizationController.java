package com.petner.anidoc.domain.vet.hospitalization.controller;

import com.petner.anidoc.domain.vet.hospitalization.dto.HospitalizationRequestDto;
import com.petner.anidoc.domain.vet.hospitalization.dto.HospitalizationResponseDto;
import com.petner.anidoc.domain.vet.hospitalization.service.HospitalizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/medical-records/{medicalRecordId}/hospitalization")
public class HospitalizationController {
    private final HospitalizationService hospitalizationService;

    @PostMapping
    public ResponseEntity<HospitalizationResponseDto> createHospitalization(
            @PathVariable Long medicalRecordId,
            @RequestParam Long userId,
            @RequestBody HospitalizationRequestDto requestDto) throws AccessDeniedException {
        HospitalizationResponseDto response = hospitalizationService.createHospitalization(requestDto, userId, medicalRecordId);
        return ResponseEntity.ok(response);
    }
}
