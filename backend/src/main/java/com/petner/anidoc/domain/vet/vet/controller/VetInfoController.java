package com.petner.anidoc.domain.vet.vet.controller;

import com.petner.anidoc.domain.vet.vet.dto.VetInfoResponseDto;
import com.petner.anidoc.domain.vet.vet.service.VetInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "동물병원 정보", description = "VetInfo 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vets")
public class VetInfoController {

    private final VetInfoService vetInfoService;

    @Operation(summary = "모든 동물병원 목록 조회", description = "모든 동물병원 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<VetInfoResponseDto>> getAllVets() {
        List<VetInfoResponseDto> vets = vetInfoService.getAllVets();
        return ResponseEntity.ok(vets);
    }

    @Operation(summary = "동물병원 상세 정보 조회", description = "특정 동물병원의 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<VetInfoResponseDto> getVetById(@PathVariable Long id) {
        VetInfoResponseDto vet = vetInfoService.getVetById(id);
        return ResponseEntity.ok(vet);
    }
}