package com.petner.anidoc.domain.vet.prescription.controller;

import com.petner.anidoc.domain.vet.prescription.dto.PrescriptionRequestDto;
import com.petner.anidoc.domain.vet.prescription.dto.PrescriptionResponseDto;
import com.petner.anidoc.domain.vet.prescription.service.PrescriptionService;
import com.petner.anidoc.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/medical-records/{medicalRecordId}/prescriptions")
@Tag(name = "처방전 관리", description = "Prescription 관련 API")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @Operation(summary = "처방전 등록", description = "진료 기록에 새로운 처방전을 등록합니다.")
    public ResponseEntity<PrescriptionResponseDto> createPrescription(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long medicalRecordId,
            @Valid @RequestBody PrescriptionRequestDto requestDto) {
        PrescriptionResponseDto response = prescriptionService.createPrescription(user.getId(), medicalRecordId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "처방전 목록 조회", description = "진료 기록의 모든 처방전을 조회합니다.")
    public ResponseEntity<List<PrescriptionResponseDto>> getPrescriptions(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long medicalRecordId) {
        List<PrescriptionResponseDto> prescriptions = prescriptionService.getPrescriptionsByMedicalRecord(user.getId(), medicalRecordId);
        return ResponseEntity.ok(prescriptions);
    }

}
