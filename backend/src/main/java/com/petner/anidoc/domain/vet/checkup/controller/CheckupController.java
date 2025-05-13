package com.petner.anidoc.domain.vet.checkup.controller;

import com.petner.anidoc.domain.vet.checkup.dto.CheckupRequestDto;
import com.petner.anidoc.domain.vet.checkup.dto.CheckupResponseDto;
import com.petner.anidoc.domain.vet.checkup.service.CheckupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/medical-records/{medicalRecordId}/checkup")
public class CheckupController {

    private final CheckupService checkupService;

    @PostMapping
    public ResponseEntity<CheckupResponseDto> createCheckup(
            @PathVariable Long medicalRecordId,
            @RequestParam Long userId,
            @RequestBody CheckupRequestDto requestDto) throws AccessDeniedException {

        CheckupResponseDto response = checkupService.createCheckup(requestDto, userId, medicalRecordId);
        return ResponseEntity.ok(response);
    }
}
