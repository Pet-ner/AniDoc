package com.petner.anidoc.domain.vet.hospitalizationrecord.controller;

import com.petner.anidoc.domain.vet.hospitalizationrecord.dto.HospitalizationRecordRequestDto;
import com.petner.anidoc.domain.vet.hospitalizationrecord.dto.HospitalizationRecordResponseDto;
import com.petner.anidoc.domain.vet.hospitalizationrecord.service.HospitalizationRecordService;
import com.petner.anidoc.domain.vet.surgeryrecord.dto.SurgeryRecordRequestDto;
import com.petner.anidoc.domain.vet.surgeryrecord.dto.SurgeryRecordResponseDto;
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

    @GetMapping
    @Operation(summary = "진료 기록에 대한 입원 기록 조회", description = "의료진이 진료기록에 입원 기록을 조회")
    public ResponseEntity<HospitalizationRecordResponseDto> getHospitalizationRecord(
            @RequestParam Long userId,
            @PathVariable Long medicalRecordId
    ) {
        HospitalizationRecordResponseDto record = hospitalizationRecordService.getHospitalizationRecord(userId, medicalRecordId);
        return ResponseEntity.ok(record);
    }

    @PutMapping("/{hospitalizationRecordId}")
    @Operation(summary = "입원 기록 수정", description = "의료진이 진료기록에 입원 기록을 수정")
    public ResponseEntity<HospitalizationRecordResponseDto> updateHospitalizationRecord(
            @RequestBody HospitalizationRecordRequestDto requestDto,
            @RequestParam Long userId,
            @PathVariable Long medicalRecordId,
            @PathVariable Long hospitalizationRecordId
    ) throws AccessDeniedException {
        HospitalizationRecordResponseDto updated = hospitalizationRecordService.updateHospitalizationRecord(requestDto, userId, medicalRecordId, hospitalizationRecordId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{hospitalizationRecordId}")
    @Operation(summary = "입원 기록 삭제", description = "의료진이 진료기록에 입원 기록을 삭제")
    public ResponseEntity<Void> deleteHospitalizationRecord(
            @RequestParam Long userId,
            @PathVariable Long medicalRecordId,
            @PathVariable Long hospitalizationRecordId
    ) throws AccessDeniedException {
        hospitalizationRecordService.deleteHospitalizationRecord(userId, medicalRecordId, hospitalizationRecordId);
        return ResponseEntity.noContent().build();
    }
}
