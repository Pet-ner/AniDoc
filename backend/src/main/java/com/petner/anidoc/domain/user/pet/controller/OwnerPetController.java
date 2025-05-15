package com.petner.anidoc.domain.user.pet.controller;

import com.petner.anidoc.domain.user.pet.dto.OwnerPetRequestDTO;
import com.petner.anidoc.domain.user.pet.dto.OwnerPetResponseDTO;
import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.pet.service.OwnerPetRegistService;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pets")
@Tag(name = "반려동물 등록", description = "OwnerPet 관련 API")
public class OwnerPetController {
    private final OwnerPetRegistService ownerPetRegistService;
    private final UserRepository userRepository;

    //반려동물 등록
    @PostMapping("/petreg")
    public ResponseEntity<?> registerPet(
            @RequestParam("ownerId") Long ownerId,
            @Valid @RequestBody OwnerPetRequestDTO ownerPetRequestDTO,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(errorMsg);
        }

        if (owner_Id == null) {
            return ResponseEntity.badRequest().body("ownerId는 null일 수 없습니다.");
        }
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("보호자를 찾을수없어요"));

        Pet pet = ownerPetRegistService.registerPet(ownerPetRequestDTO, user);
        OwnerPetResponseDTO ownerPetResponseDTO = new OwnerPetResponseDTO(pet);
        return ResponseEntity.ok(ownerPetResponseDTO);

    }
    //수정
    @PutMapping("/{petId}")
    public ResponseEntity<?> updatePet(
            @PathVariable Long petId,
            @RequestParam("ownerId") Long ownerId,
            @Valid @RequestBody OwnerPetRequestDTO ownerPetRequestDTO,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(errorMsg);
        }

        if (owner_Id == null) {
            return ResponseEntity.badRequest().body("ownerId는 null일 수 없습니다.");
        }

        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("보호자를 찾을 수 없습니다."));

        Pet pet = ownerPetRegistService.updatePet(petId, ownerPetRequestDTO, user);
        OwnerPetResponseDTO ownerPetResponseDTO = new OwnerPetResponseDTO(pet);
        return ResponseEntity.ok(ownerPetResponseDTO);
    }

}
