package com.petner.anidoc.domain.vet.medicalrecord.controller;

import com.petner.anidoc.domain.vet.medicalrecord.dto.MedicalRecordRequestDto;
import com.petner.anidoc.domain.vet.medicalrecord.dto.MedicalRecordResponseDto;
import com.petner.anidoc.domain.vet.medicalrecord.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.nio.file.attribute.UserPrincipal;

@RestController
@RequestMapping("api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;

    @PostMapping
    public ResponseEntity<MedicalRecordResponseDto> createMedicalRecord(
            @RequestBody MedicalRecordRequestDto dto,
            @RequestParam Long userId,
            @RequestParam Long reservationId/*,
            @AuthenticationPrincipal SecurityUser userDetails*/) throws AccessDeniedException {
        MedicalRecordResponseDto response = medicalRecordService.createMedicalRecord(dto,userId,reservationId);
        return ResponseEntity.ok(response);
    }
}
