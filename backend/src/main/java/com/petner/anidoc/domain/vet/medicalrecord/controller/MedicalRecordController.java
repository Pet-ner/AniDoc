package com.petner.anidoc.domain.vet.medicalrecord.controller;

import com.petner.anidoc.domain.vet.checkuprecord.dto.CheckupRecordResponseDto;
import com.petner.anidoc.domain.vet.checkuprecord.entity.CheckupRecord;
import com.petner.anidoc.domain.vet.checkuprecord.repository.CheckupRecordRepository;
import com.petner.anidoc.domain.vet.hospitalizationrecord.dto.HospitalizationRecordResponseDto;
import com.petner.anidoc.domain.vet.hospitalizationrecord.entity.HospitalizationRecord;
import com.petner.anidoc.domain.vet.hospitalizationrecord.repository.HospitalizationRecordRepository;
import com.petner.anidoc.domain.vet.medicalrecord.dto.MedicalRecordRequestDto;
import com.petner.anidoc.domain.vet.medicalrecord.dto.MedicalRecordResponseDto;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.medicalrecord.service.MedicalRecordService;
import com.petner.anidoc.domain.vet.surgeryrecord.dto.SurgeryRecordResponseDto;
import com.petner.anidoc.domain.vet.surgeryrecord.entity.SurgeryRecord;
import com.petner.anidoc.domain.vet.surgeryrecord.repository.SurgeryRecordRepository;
import com.petner.anidoc.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.nio.file.attribute.UserPrincipal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("api/medical-records")
@RequiredArgsConstructor
@Tag(name="진료기록", description = "MedicalRecord 관련 API")
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;
    private final CheckupRecordRepository checkupRecordRepository;
    private final HospitalizationRecordRepository hospitalizationRecordRepository;
    private final SurgeryRecordRepository surgeryRecordRepository;

    @PostMapping
    @Operation(summary = "진료기록 생성", description = "예약 ID와 사용자 ID를 기반으로 진료기록을 생성")
    public ResponseEntity<?> createMedicalRecord(
            @RequestBody MedicalRecordRequestDto dto,
            @AuthenticationPrincipal SecurityUser user,
            @RequestParam Long reservationId) throws AccessDeniedException {
        Long userId = user.getId();
        MedicalRecordResponseDto response = medicalRecordService.createMedicalRecord(dto,userId,reservationId);

        Map<String, Object> result = new HashMap<>();
        result.put("medicalRecord", response);
        result.put("hasMedicalRecord", true);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{medicalRecordId}")
    @Operation(summary = "진료기록 단건 상세 조회", description = "사용자 ID와 진료기록 ID를 기반으로 진료기록을 조회")
    public ResponseEntity<?> getMedicalRecord(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long medicalRecordId){
        Long userId = user.getId();
        MedicalRecordResponseDto response = medicalRecordService.getMedicalRecord(userId, medicalRecordId);

        Map<String, Object> result = new HashMap<>();
        result.put("medicalRecord", response);
        result.put("hasMedicalRecord", true);

        return ResponseEntity.ok(result);

    }

    @PutMapping("/{medicalRecordId}")
    @Operation(summary = "진료기록 수정", description = "사용자 ID와 진료기록 ID를 기반으로 진료기록을 수정")
    public ResponseEntity<MedicalRecordResponseDto> updateMedicalRecord(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long medicalRecordId,
            @RequestBody MedicalRecordRequestDto medicalRecordRequestDto) throws AccessDeniedException {
        Long userId = user.getId();
        MedicalRecordResponseDto response = medicalRecordService.updateMedicalRecord(userId, medicalRecordId, medicalRecordRequestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{medicalRecordId}")
    @Operation(summary = "진료기록 삭제", description = "사용자 ID와 진료기록 ID를 기반으로 진료기록을 삭제(soft delete)")
    public ResponseEntity<Void> deleteMedicalRecord(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long medicalRecordId) throws AccessDeniedException {
        Long userId = user.getId();
        medicalRecordService.deleteMedicalRecord(medicalRecordId,userId);
        return ResponseEntity.noContent().build();

    }

    @GetMapping("/by-reservation/{reservationId}")
    public ResponseEntity<?> getMedicalRecordByReservationId(
            @PathVariable Long reservationId,
            @AuthenticationPrincipal SecurityUser user
    ) {
        try {
            Long userId = user.getId();

            // 1. 기본 진료기록 엔티티 조회
            MedicalRecord record = medicalRecordService.getMedicalRecordByReservationId(reservationId, userId);

            // 2. 연관된 수술, 입원, 검사 기록 가져오기
            SurgeryRecord surgery = surgeryRecordRepository.findByMedicalRecordId(record.getId()).orElse(null);
            HospitalizationRecord hospitalization = hospitalizationRecordRepository.findByMedicalRecordId(record.getId()).orElse(null);
            List<CheckupRecord> checkups = checkupRecordRepository.findAllByMedicalRecordId(record.getId());

            // 3. 각각 DTO로 변환
            SurgeryRecordResponseDto surgeryDto = surgery != null ? SurgeryRecordResponseDto.from(surgery) : null;
            HospitalizationRecordResponseDto hospitalizationDto = hospitalization != null ? HospitalizationRecordResponseDto.from(hospitalization) : null;
            List<CheckupRecordResponseDto> checkupDtos = checkups.stream()
                    .map(CheckupRecordResponseDto::from)
                    .toList();

            // 4. 모든 데이터를 포함한 응답 DTO 생성
            MedicalRecordResponseDto dto = MedicalRecordResponseDto.from(
                    record,
                    surgeryDto,
                    hospitalizationDto,
                    checkupDtos
            );

            // 5. 응답 반환
            return ResponseEntity.ok(Map.of(
                    "hasMedicalRecord", true,
                    "medicalRecord", dto
            ));



        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (AccessDeniedException e) {
            throw new RuntimeException(e); // 필요시 403 응답으로 바꾸는 것도 고려
        }
    }

    @GetMapping("/by-user/{userId}")
    @Operation(summary = "보호자 ID로 진료기록 목록 조회", description = "특정 보호자의 모든 진료기록을 반환")
    public ResponseEntity<?> getMedicalRecordsByUserId(@AuthenticationPrincipal SecurityUser user) {
        Long userId = user.getId();
        List<MedicalRecordResponseDto> records = medicalRecordService.getMedicalRecordsByUserId(userId);

        return ResponseEntity.ok(Map.of(
                "hasMedicalRecords", !records.isEmpty(),
                "medicalRecords", records
        ));
    }






}
