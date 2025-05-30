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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pets")
@Tag(name = "보호자 반려동물", description = "OwnerPet 관련 API")
public class OwnerPetController {
    @Autowired
    private final OwnerPetRegistService ownerPetRegistService;
    private final UserRepository userRepository;

    //반려동물 등록
    @PostMapping("/petreg")
    @Operation(summary = "보호자 반려동물 등록", description = "보호자가 반려동물을 등록")
    public ResponseEntity<?> registerPet(
            @Valid @RequestBody OwnerPetRequestDTO ownerPetRequestDTO,
            BindingResult bindingResult,
            @AuthenticationPrincipal UserDetails currentUser) {

        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(errorMsg);
        }
        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));

        Pet pet = ownerPetRegistService.registerPet(ownerPetRequestDTO, user);
        OwnerPetResponseDTO ownerPetResponseDTO = new OwnerPetResponseDTO(pet);
        return ResponseEntity.ok(ownerPetResponseDTO);
    }

    //수정
    @PutMapping("/{petId}")
    @Operation(summary = "보호자 반려동물 수정", description = "보호자가 반려동물을 등록한것을 수정")
    public ResponseEntity<?> updatePet(
            @PathVariable Long petId,
            @Valid @RequestBody OwnerPetRequestDTO ownerPetRequestDTO,
            BindingResult bindingResult,
            @AuthenticationPrincipal UserDetails currentUser) {

        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(errorMsg);
        }
        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));

        Pet pet = ownerPetRegistService.updatePet(petId, ownerPetRequestDTO, user);
        OwnerPetResponseDTO ownerPetResponseDTO = new OwnerPetResponseDTO(pet);
        return ResponseEntity.ok(ownerPetResponseDTO);
    }

    //전체 조회
    @GetMapping
    @Operation(summary = "보호자 반려동물 전체 조회", description = "보호자가 반려동물을 등록한것을 전체 조회")
    public ResponseEntity<?> findByOwnerAllPets(
            @AuthenticationPrincipal UserDetails currentUser){

        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));

        List<Pet> pets = ownerPetRegistService.findAllPetsByOwner(user.getId());
        List<OwnerPetResponseDTO> ownerPetResponseDTO = pets.stream()
                .map(OwnerPetResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ownerPetResponseDTO);
    }


    //상세 조회
    @GetMapping("/{petId}")
    @Operation(summary = "보호자 반려동물 상세 조회", description = "보호자가 반려동물을 등록한것을 상세 조회")
    public ResponseEntity<?> findPet(
            @PathVariable Long petId,
            @AuthenticationPrincipal UserDetails currentUser){

        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));

        Pet pet = ownerPetRegistService.findPetByOwner(petId, user.getId());
        OwnerPetResponseDTO ownerPetResponseDTO = new OwnerPetResponseDTO(pet);
        return ResponseEntity.ok(ownerPetResponseDTO);

    }

    //삭제
    @DeleteMapping("/{petId}")
    @Operation(summary = "보호자 반려동물 삭제", description = "보호자가 자신의 반려동물을 삭제")
    public ResponseEntity<?> deletePet(
            @PathVariable Long petId,
            @AuthenticationPrincipal UserDetails currentUser) {

        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));

        ownerPetRegistService.deletePet(petId, user);
        return ResponseEntity.ok("삭제되었습니다.");
    }


}
