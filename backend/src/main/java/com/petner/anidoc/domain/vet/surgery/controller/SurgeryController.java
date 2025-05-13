package com.petner.anidoc.domain.vet.surgery.controller;

import com.petner.anidoc.domain.vet.surgery.dto.SurgeryRequestDto;
import com.petner.anidoc.domain.vet.surgery.dto.SurgeryResponseDto;
import com.petner.anidoc.domain.vet.surgery.service.SurgeryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/medical-records/{medicalRecordId}/surgery")
public class SurgeryController {

    private final SurgeryService surgeryService;

    @PostMapping
    public ResponseEntity<SurgeryResponseDto> createSurgery(
            @PathVariable Long medicalRecordId,
            @RequestParam Long userId,
            @RequestBody SurgeryRequestDto requestDto) throws AccessDeniedException {

        SurgeryResponseDto response = surgeryService.createSurgery(requestDto, userId, medicalRecordId);
        return ResponseEntity.ok(response);
    }
}
