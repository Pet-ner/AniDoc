package com.petner.anidoc.domain.user.pet.controller;

import com.petner.anidoc.domain.user.pet.dto.DoctorPetRequestDTO;
import com.petner.anidoc.domain.user.pet.dto.DoctorPetResponseDTO;
import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.pet.service.DoctorPetRegistService;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/doctor/pets")
@Tag(name = "의료진 반려동물", description = "DoctorPet 관련 API")
public class DoctorPetController {
    private final DoctorPetRegistService doctorPetRegistService;
    private final UserRepository userRepository;

    //반려동물 수정
    @PutMapping("/{petId}")
    @Operation(summary = "의료진 반려동물 수정", description = "의료진이 반려동물을 진료후 수정")
    public ResponseEntity<?> updatePetByDoctor(
            @PathVariable Long petId,
            @Valid @RequestBody DoctorPetRequestDTO doctorPetRequestDTO,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(errorMsg);
        }

        Pet pet = doctorPetRegistService.updatePet(petId, doctorPetRequestDTO);
        DoctorPetResponseDTO doctorPetResponseDTO = new DoctorPetResponseDTO(pet);
        return ResponseEntity.ok(doctorPetResponseDTO);
    }
    //전체조회
    @GetMapping
    @Operation(summary = "의료진 반려동물 전체조회", description = "의료진이 모든 반려동물을 조회")
    public ResponseEntity<?> finaAllPets(){
        List<Pet> pets = doctorPetRegistService.findAllPets();
        List<DoctorPetResponseDTO> doctorPetResponseDTO = pets.stream()
                .map(DoctorPetResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(doctorPetResponseDTO);
    }


    //상세조회
    @GetMapping("/{petId}")
    @Operation(summary = "의료진 반려동물 조회", description = "의료진이 반려동물을 조회")
    public ResponseEntity<?> findPet(
            @PathVariable Long petId){
        Pet pet = doctorPetRegistService.findPetByDoctor(petId);
        DoctorPetResponseDTO doctorPetResponseDTO = new DoctorPetResponseDTO(pet);
        return ResponseEntity.ok(doctorPetResponseDTO);
    }

    //삭제
    @DeleteMapping("/{petId}")
    @Operation(summary = "의료진 반려동물 삭제", description = "의료진이 반려동물을 삭제")
    public ResponseEntity<?> deletePet(
            @PathVariable Long petId) {

        doctorPetRegistService.deletePet(petId);
        return ResponseEntity.ok("삭제되었습니다.");
    }

}