package com.petner.anidoc.domain.vet.checkup.controller;

import com.petner.anidoc.domain.vet.checkup.dto.CheckupRequestDto;
import com.petner.anidoc.domain.vet.checkup.dto.CheckupResponseDto;
import com.petner.anidoc.domain.vet.checkup.service.CheckupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/medical-records/{medicalRecordId}/checkup")
@Tag(name="검사", description = "Check Up 관련 API")
public class CheckupController {

    private final CheckupService checkupService;

    @PostMapping
    @Operation(summary = "검사 결과 생성", description = "의료진이 진료기록에 검사 결과를 등록")
    public ResponseEntity<CheckupResponseDto> createCheckup(
            @PathVariable Long medicalRecordId,
            @RequestParam Long userId,
            @RequestBody CheckupRequestDto requestDto) throws AccessDeniedException {

        CheckupResponseDto response = checkupService.createCheckup(requestDto, userId, medicalRecordId);
        return ResponseEntity.ok(response);
    }
}
