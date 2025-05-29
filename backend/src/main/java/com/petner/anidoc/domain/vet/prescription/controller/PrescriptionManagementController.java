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
@RequestMapping("/api/prescriptions")
@Tag(name = "처방전 관리", description = "Prescription 관련 API")
public class PrescriptionManagementController {

    private final PrescriptionService prescriptionService;

    @GetMapping("/{prescriptionId}")
    @Operation(summary = "처방전 상세 조회", description = "특정 처방전의 상세 정보를 조회합니다.")
    public ResponseEntity<PrescriptionResponseDto> getPrescription(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long prescriptionId) {
        PrescriptionResponseDto prescription = prescriptionService.getPrescription(user.getId(), prescriptionId);
        return ResponseEntity.status(HttpStatus.CREATED).body(prescription);
    }

    @PutMapping("/{prescriptionId}")
    @Operation(summary = "처방전 수정", description = "처방전의 정보를 수정합니다.")
    public ResponseEntity<PrescriptionResponseDto> updatePrescription(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long prescriptionId,
            @Valid @RequestBody PrescriptionRequestDto requestDto) {
        PrescriptionResponseDto response = prescriptionService.updatePrescription(user.getId(), prescriptionId, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{prescriptionId}")
    @Operation(summary = "처방전 삭제", description = "처방전을 삭제합니다.")
    public ResponseEntity<Void> deletePrescription(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long prescriptionId) {
        prescriptionService.deletePrescription(user.getId(), prescriptionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/medicine/{medicineId}")
    @Operation(summary = "약품별 처방 내역 조회", description = "특정 약품의 처방 내역을 조회합니다.")
    public ResponseEntity<List<PrescriptionResponseDto>> getPrescriptionsByMedicine(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long medicineId) {
        List<PrescriptionResponseDto> prescriptions = prescriptionService.getPrescriptionsByMedicine(user.getId(), medicineId);
        return ResponseEntity.ok(prescriptions);
    }
}