package com.petner.anidoc.domain.vet.vaccination.controller;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.vaccination.dto.OwnerPetVaccinDTO;
import com.petner.anidoc.domain.vet.vaccination.service.OwnerPetVaccinService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner/vaccins")
@Tag(name = "보호자 반려동물 예방접종", description = "OwnerPetVaccin 관련 API")
public class OwnerPetVaccinController {
    private final OwnerPetVaccinService ownerPetVaccinService;
    private final UserRepository userRepository;

    // 전체 조회
    @GetMapping
    @Operation(summary = "보호자 반려동물 예방접종 전체조회", description = "보호자 반려동물 예방접종 전체조회")
    public ResponseEntity<List<OwnerPetVaccinDTO>> getAllMyVaccinations(@AuthenticationPrincipal UserDetails currentUser) {
        User owner = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));
        List<OwnerPetVaccinDTO> result = ownerPetVaccinService.findAllByOwner(owner.getId());
        return ResponseEntity.ok(result);
    }

    // 상세 조회
    @GetMapping("/{vaccinationId}")
    @Operation(summary = "보호자 반려동물 예방접종 상세조회", description = "보호자 반려동물 예방접종 상세조회")
    public ResponseEntity<OwnerPetVaccinDTO> getMyVaccinationDetail(
            @PathVariable Long vaccinationId,
            @AuthenticationPrincipal UserDetails currentUser) {
        User owner = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));
        OwnerPetVaccinDTO result = ownerPetVaccinService.findByIdAndOwner(vaccinationId, owner.getId());
        return ResponseEntity.ok(result);
    }
}
