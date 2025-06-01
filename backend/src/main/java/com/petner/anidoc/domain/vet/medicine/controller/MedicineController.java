package com.petner.anidoc.domain.vet.medicine.controller;

import com.petner.anidoc.domain.vet.medicine.dto.*;
import com.petner.anidoc.domain.vet.medicine.service.MedicineService;
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
@RequestMapping("/api/medicines")
@Tag(name = "약품 관리", description = "Medicine 관련 API")
public class MedicineController {

    private final MedicineService medicineService;

    @PostMapping
    @Operation(summary = "약품 등록", description = "새로운 약품을 등록합니다.")
    public ResponseEntity<MedicineResponseDto> createMedicine(
            @AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody MedicineRequestDto requestDto) {
        MedicineResponseDto response = medicineService.createMedicine(user.getId(), requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/all")
    @Operation(summary = "모든 약품 조회", description = "병원의 모든 약품을 조회합니다.")
    public ResponseEntity<List<MedicineResponseDto>> getAllMedicines(@AuthenticationPrincipal SecurityUser user) {
        List<MedicineResponseDto> medicines = medicineService.getAllMedicinesByVet(user.getId());
        return ResponseEntity.ok(medicines);
    }

    @GetMapping("/{medicineId}")
    @Operation(summary = "약품 상세 조회", description = "특정 약품의 상세 정보를 조회합니다.")
    public ResponseEntity<MedicineResponseDto> getMedicine(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long medicineId) {
        MedicineResponseDto medicine = medicineService.getMedicine(user.getId(), medicineId);
        return ResponseEntity.ok(medicine);
    }

    @PutMapping("/{medicineId}")
    @Operation(summary = "약품 정보 수정", description = "약품의 정보를 수정합니다.")
    public ResponseEntity<MedicineResponseDto> updateMedicine(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long medicineId,
            @Valid @RequestBody MedicineRequestDto requestDto) {
        MedicineResponseDto response = medicineService.updateMedicine(user.getId(), medicineId, requestDto);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{medicineId}/stock")
    @Operation(summary = "약품 재고 업데이트", description = "약품의 재고 수량을 업데이트합니다.")
    public ResponseEntity<MedicineResponseDto> updateStock(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long medicineId,
            @Valid @RequestBody MedicineStockUpdateDto requestDto) {
        MedicineResponseDto response = medicineService.updateStock(user.getId(), medicineId, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{medicineId}")
    @Operation(summary = "약품 삭제", description = "약품을 삭제합니다.")
    public ResponseEntity<Void> deleteMedicine(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long medicineId) {
        medicineService.deleteMedicine(user.getId(), medicineId);
        return ResponseEntity.noContent().build();
    }

}