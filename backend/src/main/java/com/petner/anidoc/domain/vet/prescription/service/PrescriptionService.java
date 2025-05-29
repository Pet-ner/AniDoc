package com.petner.anidoc.domain.vet.prescription.service;

import com.petner.anidoc.domain.vet.prescription.dto.PrescriptionRequestDto;
import com.petner.anidoc.domain.vet.prescription.dto.PrescriptionResponseDto;
import com.petner.anidoc.domain.vet.prescription.entity.Prescription;
import com.petner.anidoc.domain.vet.prescription.repository.PrescriptionRepository;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.medicalrecord.repository.MedicalRecordRepository;
import com.petner.anidoc.domain.vet.medicine.entity.Medicine;
import com.petner.anidoc.domain.vet.medicine.repository.MedicineRepository;
import com.petner.anidoc.domain.vet.medicine.service.MedicineService;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.global.exception.CustomException;
import com.petner.anidoc.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final MedicineService medicineService;

    // 처방전 등록
    @Transactional
    public PrescriptionResponseDto createPrescription(Long userId, Long medicalRecordId, PrescriptionRequestDto requestDto) {
        User user = getUserAndValidateRole(userId);
        MedicalRecord medicalRecord = getMedicalRecordAndValidateAccess(medicalRecordId, user);
        Medicine medicine = getMedicineAndValidateAccess(requestDto.getMedicineId(), user);

        // 재고 확인
        if (!medicine.canPrescribe(requestDto.getQuantity())) {
            throw new CustomException(ErrorCode.INSUFFICIENT_STOCK);
        }

        Prescription prescription = Prescription.builder()
                .medicalRecord(medicalRecord)
                .medicine(medicine)
                .quantity(requestDto.getQuantity())
                .dosage(requestDto.getDosage())
                .build();

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // 약품 재고 차감
        medicineService.decreaseStock(medicine.getId(), requestDto.getQuantity());

        return PrescriptionResponseDto.fromEntity(savedPrescription);
    }

    // 진료 기록별 처방전 목록 조회
    @Transactional(readOnly = true)
    public List<PrescriptionResponseDto> getPrescriptionsByMedicalRecord(Long userId, Long medicalRecordId) {
        User user = getUserAndValidateRole(userId);
        MedicalRecord medicalRecord = getMedicalRecordAndValidateAccess(medicalRecordId, user);

        List<Prescription> prescriptions = prescriptionRepository.findByMedicalRecordOrderByCreatedAtAsc(medicalRecord);
        return prescriptions.stream()
                .map(PrescriptionResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 처방전 상세 조회
    @Transactional(readOnly = true)
    public PrescriptionResponseDto getPrescription(Long userId, Long prescriptionId) {
        User user = getUserAndValidateRole(userId);
        Prescription prescription = getPrescriptionAndValidateAccess(prescriptionId, user);

        return PrescriptionResponseDto.fromEntity(prescription);
    }

    // 처방전 수정
    @Transactional
    public PrescriptionResponseDto updatePrescription(Long userId, Long prescriptionId, PrescriptionRequestDto requestDto) {
        User user = getUserAndValidateRole(userId);
        Prescription prescription = getPrescriptionAndValidateAccess(prescriptionId, user);

        // 기존 약품과 수량 저장
        Medicine oldMedicine = prescription.getMedicine();
        Integer oldQuantity = prescription.getQuantity();

        // 새로운 약품 확인
        Medicine newMedicine = getMedicineAndValidateAccess(requestDto.getMedicineId(), user);

        // 기존 재고 복구
        medicineService.increaseStock(oldMedicine.getId(), oldQuantity);

        // 새로운 재고 확인
        if (!newMedicine.canPrescribe(requestDto.getQuantity())) {
            // 실패 시 기존 재고 다시 차감
            medicineService.decreaseStock(oldMedicine.getId(), oldQuantity);
            throw new CustomException(ErrorCode.INSUFFICIENT_STOCK);
        }

        // 엔티티의 업데이트 메서드 사용
        prescription.updateFromDto(requestDto, newMedicine);

        // 새로운 약품 재고 차감
        medicineService.decreaseStock(newMedicine.getId(), requestDto.getQuantity());

        return PrescriptionResponseDto.fromEntity(prescription);
    }

    // 처방전 삭제
    @Transactional
    public void deletePrescription(Long userId, Long prescriptionId) {
        User user = getUserAndValidateRole(userId);
        Prescription prescription = getPrescriptionAndValidateAccess(prescriptionId, user);

        // 재고 복구
        medicineService.increaseStock(prescription.getMedicine().getId(), prescription.getQuantity());

        prescriptionRepository.delete(prescription);
    }

    // 약품별 처방 내역 조회
    @Transactional(readOnly = true)
    public List<PrescriptionResponseDto> getPrescriptionsByMedicine(Long userId, Long medicineId) {
        User user = getUserAndValidateRole(userId);
        Medicine medicine = getMedicineAndValidateAccess(medicineId, user);

        List<Prescription> prescriptions = prescriptionRepository.findByMedicineOrderByCreatedAtDesc(medicine);
        return prescriptions.stream()
                .map(PrescriptionResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 유저 권한 검증 (관리자 또는 의료진만 가능)
    private User getUserAndValidateRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!user.getRole().equals(UserRole.ROLE_ADMIN) && !user.getRole().equals(UserRole.ROLE_STAFF)) {
            throw new CustomException(ErrorCode.NO_PRESCRIPTION_MANAGE_PERMISSION);
        }

        if (user.getVetInfo() == null) {
            throw new CustomException(ErrorCode.VET_NOT_FOUND);
        }

        return user;
    }

    // 진료 기록 접근 권한 검증
    private MedicalRecord getMedicalRecordAndValidateAccess(Long medicalRecordId, User user) {
        MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndIsDeletedFalse(medicalRecordId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEDICAL_RECORD_NOT_FOUND));

        // 같은 병원 소속인지 확인
        if (!medicalRecord.getDoctor().getVetInfo().getId().equals(user.getVetInfo().getId())) {
            throw new CustomException(ErrorCode.NO_MEDICAL_RECORD_MANAGE_PERMISSION);
        }

        return medicalRecord;
    }

    // 약품 접근 권한 검증
    private Medicine getMedicineAndValidateAccess(Long medicineId, User user) {
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEDICINE_NOT_FOUND));

        if (!medicine.getVetInfo().getId().equals(user.getVetInfo().getId())) {
            throw new CustomException(ErrorCode.NO_MEDICINE_MANAGE_PERMISSION);
        }

        return medicine;
    }

    // 처방전 접근 권한 검증
    private Prescription getPrescriptionAndValidateAccess(Long prescriptionId, User user) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new CustomException(ErrorCode.PRESCRIPTION_NOT_FOUND));

        // 같은 병원 소속인지 확인
        if (!prescription.getMedicine().getVetInfo().getId().equals(user.getVetInfo().getId())) {
            throw new CustomException(ErrorCode.NO_PRESCRIPTION_MANAGE_PERMISSION);
        }

        return prescription;
    }
}