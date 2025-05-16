package com.petner.anidoc.domain.user.pet.controller;

import com.petner.anidoc.domain.user.pet.dto.OwnerPetRequestDTO;
import com.petner.anidoc.domain.user.pet.dto.OwnerPetResponseDTO;
import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.pet.service.OwnerPetRegistService;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pets")
@Tag(name = "보호자 반려동물", description = "OwnerPet 관련 API")
public class OwnerPetController {
    private final OwnerPetRegistService ownerPetRegistService;
    private final UserRepository userRepository;

    //반려동물 등록
    @PostMapping("/petreg")
    @Operation(summary = "보호자 반려동물 등록", description = "보호자가 반려동물을 등록")
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

        if (ownerId == null) {
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
    @Operation(summary = "보호자 반려동물 수정", description = "보호자가 반려동물을 등록한것을 수정")
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

        if (ownerId == null) {
            return ResponseEntity.badRequest().body("ownerId는 null일 수 없습니다.");
        }

        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("보호자를 찾을 수 없습니다."));

        Pet pet = ownerPetRegistService.updatePet(petId, ownerPetRequestDTO, user);
        OwnerPetResponseDTO ownerPetResponseDTO = new OwnerPetResponseDTO(pet);
        return ResponseEntity.ok(ownerPetResponseDTO);
    }
    //전체 조회
    @GetMapping
    @Operation(summary = "보호자 반려동물 전체 조회", description = "보호자가 반려동물을 등록한것을 전체 조회")
    public ResponseEntity<?> findByOwnerAllPets(
            @RequestParam("ownerId") Long ownerId){
        List<Pet> pets = ownerPetRegistService.findAllPetsByOwner(ownerId);
        List<OwnerPetResponseDTO> ownerPetResponseDTO = pets.stream()
                .map(OwnerPetResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ownerPetResponseDTO);
    }


    //조회
    @GetMapping("/{petId}")
    @Operation(summary = "보호자 반려동물 상세 조회", description = "보호자가 반려동물을 등록한것을 상세 조회")
    public ResponseEntity<?> findPet(
            @PathVariable Long petId,
            @RequestParam("ownerId") Long ownerId){
        Pet pet = ownerPetRegistService.findPetByOwner(petId, ownerId);
        OwnerPetResponseDTO ownerPetResponseDTO = new OwnerPetResponseDTO(pet);
        return ResponseEntity.ok(ownerPetResponseDTO);

    }


}
