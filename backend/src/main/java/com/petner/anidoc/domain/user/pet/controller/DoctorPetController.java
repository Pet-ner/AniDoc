package com.petner.anidoc.domain.user.pet.controller;

import com.petner.anidoc.domain.user.pet.dto.DoctorPetRequestDTO;
import com.petner.anidoc.domain.user.pet.dto.DoctorPetResponseDTO;
import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.pet.service.DoctorPetRegistService;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/doctor/pets")
@Tag(name = "의료진 반려동물 등록", description = "DoctorPet 관련 API")
public class DoctorPetController {
    private final DoctorPetRegistService doctorPetRegistService;
    private final UserRepository userRepository;

    //반료동물 등록 및 수정
    @PutMapping("/{petId}")
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
}