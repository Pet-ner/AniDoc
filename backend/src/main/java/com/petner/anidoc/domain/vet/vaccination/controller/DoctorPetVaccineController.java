package com.petner.anidoc.domain.vet.vaccination.controller;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.vaccination.dto.DoctorPetVaccineRequestDTO;
import com.petner.anidoc.domain.vet.vaccination.dto.DoctorPetVaccineResponseDTO;
import com.petner.anidoc.domain.vet.vaccination.dto.VaccinationStatusDto;
import com.petner.anidoc.domain.vet.vaccination.entity.Vaccination;
import com.petner.anidoc.domain.vet.vaccination.service.DoctorPetVaccineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
@PreAuthorize("hasRole('ROLE_STAFF')")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/doctor/vaccines")
@Tag(name = "의료진 반려동물 예방접종", description = "DoctorPetVaccine 관련 API")
public class DoctorPetVaccineController {
    private final DoctorPetVaccineService doctorPetVaccineService;
    private final UserRepository userRepository;

    //반려동물 등록(예방접종)
    @PostMapping("/{petId}/vaccinereg")
    @Operation(summary = "의료진 반려동물 예방접종 등록", description = "의료진 반려동물 예방접종 등록")
    public ResponseEntity<?> registerPetVaccine(
            @PathVariable Long petId,
            @Valid @RequestBody DoctorPetVaccineRequestDTO doctorPetVaccineRequestDTO,
            BindingResult bindingResult,
            @AuthenticationPrincipal UserDetails currentUser){
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(errorMsg);
        }
        User doctor = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));

        Vaccination vaccination = doctorPetVaccineService.registerVaccination(petId, doctorPetVaccineRequestDTO, doctor);;
        DoctorPetVaccineResponseDTO doctorPetVaccinResponseDTO = new DoctorPetVaccineResponseDTO(vaccination);

        return ResponseEntity.ok(doctorPetVaccinResponseDTO);
    }
    //반려동물 수정(예방접종)
    @PutMapping("/{vaccinationId}")
    @Operation(summary = "의료진 반려동물 예방접종 수정", description = "의료진 반려동물 예방접종 수정")
    public ResponseEntity<?> updatePetVaccine(
            @PathVariable Long vaccinationId,
            @Valid @RequestBody DoctorPetVaccineRequestDTO doctorPetVaccinRequestDTO,
            BindingResult bindingResult,
            @AuthenticationPrincipal UserDetails currentUser){
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(errorMsg);
        }
        User currentDoctor = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));

        DoctorPetVaccineResponseDTO doctorPetVaccineResponseDTO = doctorPetVaccineService.updateVaccine(vaccinationId, doctorPetVaccinRequestDTO, currentDoctor);
        return ResponseEntity.ok(doctorPetVaccineResponseDTO);
    }

    //전체조회
    @GetMapping
    @Operation(summary = "예방접종 전체 조회", description = "예방접종 전체 조회")
    public ResponseEntity<List<DoctorPetVaccineResponseDTO>> getAllVaccinations() {
        List<DoctorPetVaccineResponseDTO> result = doctorPetVaccineService.findAllVaccinations();
        return ResponseEntity.ok(result);
    }

    //상세조회
    @GetMapping("/{vaccinationId}")
    @Operation(summary = "예방접종 상세 조회", description = "예방접종 상세 조회")
    public ResponseEntity<DoctorPetVaccineResponseDTO> getVaccinationDetail(@PathVariable Long vaccinationId) {
        DoctorPetVaccineResponseDTO result = doctorPetVaccineService.findVaccinationById(vaccinationId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/reservation/{reservationId}")
    @Operation(summary = "예약별 예방접종 기록 조회", description = "특정 예약에 대한 예방접종 기록을 조회합니다")
    public ResponseEntity<DoctorPetVaccineResponseDTO> getVaccinationByReservation(
            @PathVariable Long reservationId) {
        DoctorPetVaccineResponseDTO result = doctorPetVaccineService.findVaccinationByReservationId(reservationId);
        return ResponseEntity.ok(result);
    }

    //삭제
    @DeleteMapping("/{vaccinationId}")
    @Operation(summary = "예방접종 삭제", description = "예방접종 삭제")
    public ResponseEntity<?> deleteVaccination(
            @PathVariable Long vaccinationId,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        User currentDoctor = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(()-> new RuntimeException("사용자 정보를 찾을 수 없습니다."));

        doctorPetVaccineService.deleteVaccination(vaccinationId, currentDoctor);
        return ResponseEntity.ok().body("예방접종 기록이 삭제되었습니다.");
    }

    @GetMapping("/status/reservation/{reservationId}")
    @Operation(summary = "예약별 백신 기록 상태 확인", description = "특정 예약에 백신 기록 상태를 확인합니다")
    public ResponseEntity<VaccinationStatusDto> getVaccinationStatus(@PathVariable Long reservationId) {
        VaccinationStatusDto status = doctorPetVaccineService.getVaccinationStatusByReservationId(reservationId);
        return ResponseEntity.ok(status);
    }
}
