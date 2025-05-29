package com.petner.anidoc.domain.vet.medicine.service;

import com.petner.anidoc.domain.vet.medicine.dto.MedicineRequestDto;
import com.petner.anidoc.domain.vet.medicine.dto.MedicineResponseDto;
import com.petner.anidoc.domain.vet.medicine.dto.MedicineSearchDto;
import com.petner.anidoc.domain.vet.medicine.dto.MedicineStockUpdateDto;
import com.petner.anidoc.domain.vet.medicine.entity.Medicine;
import com.petner.anidoc.domain.vet.medicine.repository.MedicineRepository;
import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
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
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;

    // 약품 등록
    @Transactional
    public MedicineResponseDto createMedicine(Long userId, MedicineRequestDto requestDto) {
        User user = getUserAndValidateRole(userId);
        VetInfo vetInfo = user.getVetInfo();

        // 같은 병원에 동일한 약품명이 있는지 확인
        if (medicineRepository.findByVetInfoAndMedicationName(vetInfo, requestDto.getMedicationName()).isPresent()) {
            throw new CustomException(ErrorCode.MEDICINE_ALREADY_REGISTERED);
        }

        Medicine medicine = Medicine.builder()
                .vetInfo(vetInfo)
                .medicationName(requestDto.getMedicationName())
                .stock(requestDto.getStock())
                .build();

        Medicine savedMedicine = medicineRepository.save(medicine);

        return MedicineResponseDto.fromEntity(savedMedicine);
    }

    // 약품 목록 조회 (병원별)
    @Transactional(readOnly = true)
    public List<MedicineResponseDto> getMedicinesByVet(Long userId) {
        User user = getUserAndValidateRole(userId);
        VetInfo vetInfo = user.getVetInfo();

        List<Medicine> medicines = medicineRepository.findByVetInfoOrderByMedicationNameAsc(vetInfo);
        return medicines.stream()
                .map(MedicineResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 약품 상세 조회
    @Transactional(readOnly = true)
    public MedicineResponseDto getMedicine(Long userId, Long medicineId) {
        User user = getUserAndValidateRole(userId);
        Medicine medicine = getMedicineAndValidateAccess(medicineId, user.getVetInfo());

        return MedicineResponseDto.fromEntity(medicine);
    }

    // 약품 정보 수정
    @Transactional
    public MedicineResponseDto updateMedicine(Long userId, Long medicineId, MedicineRequestDto requestDto) {
        User user = getUserAndValidateRole(userId);
        Medicine medicine = getMedicineAndValidateAccess(medicineId, user.getVetInfo());

        // 약품명 변경 시 중복 확인 (현재 약품 제외)
        if (!medicine.getMedicationName().equals(requestDto.getMedicationName())) {
            if (medicineRepository.findByVetInfoAndMedicationName(user.getVetInfo(), requestDto.getMedicationName()).isPresent()) {
                throw new CustomException(ErrorCode.MEDICINE_ALREADY_REGISTERED);
            }
        }

        // 엔티티의 업데이트 메서드 사용
        medicine.updateFromDto(requestDto);

        return MedicineResponseDto.fromEntity(medicine);
    }

    // 약품 재고 업데이트
    @Transactional
    public MedicineResponseDto updateStock(Long userId, Long medicineId, MedicineStockUpdateDto requestDto) {
        User user = getUserAndValidateRole(userId);
        Medicine medicine = getMedicineAndValidateAccess(medicineId, user.getVetInfo());

        if (requestDto.getStock() < 0) {
            throw new CustomException(ErrorCode.INVALID_STOCK_VALUE);
        }

        // 엔티티의 재고 업데이트 메서드 사용
        medicine.updateStock(requestDto.getStock());

        return MedicineResponseDto.fromEntity(medicine);
    }

    // 약품 삭제
    @Transactional
    public void deleteMedicine(Long userId, Long medicineId) {
        User user = getUserAndValidateRole(userId);
        Medicine medicine = getMedicineAndValidateAccess(medicineId, user.getVetInfo());

        medicineRepository.delete(medicine);
    }

    // 약품 검색 (약품명으로)
    @Transactional(readOnly = true)
    public List<MedicineSearchDto> searchMedicines(Long userId, String keyword) {
        User user = getUserAndValidateRole(userId);
        VetInfo vetInfo = user.getVetInfo();

        List<Medicine> medicines = medicineRepository.findByVetInfoAndMedicationNameContaining(vetInfo, keyword);
        return medicines.stream()
                .map(MedicineSearchDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 재고 부족 약품 조회
    @Transactional(readOnly = true)
    public List<MedicineResponseDto> getLowStockMedicines(Long userId, Integer minimum) {
        User user = getUserAndValidateRole(userId);
        VetInfo vetInfo = user.getVetInfo();

        if (minimum == null) {
            minimum = 10; // 기본값: 10개 이하
        }

        List<Medicine> medicines = medicineRepository.findLowStockMedicines(vetInfo, minimum);
        return medicines.stream()
                .map(MedicineResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 사용 가능한 약품 목록 조회 (재고 > 0)
    @Transactional(readOnly = true)
    public List<MedicineSearchDto> getAvailableMedicines(Long userId) {
        User user = getUserAndValidateRole(userId);
        VetInfo vetInfo = user.getVetInfo();

        List<Medicine> medicines = medicineRepository.findAvailableMedicines(vetInfo);
        return medicines.stream()
                .map(MedicineSearchDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 약품 재고 차감 (처방 시 사용)
    @Transactional
    public void decreaseStock(Long medicineId, Integer quantity) {
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEDICINE_NOT_FOUND));

        if (quantity <= 0) {
            throw new CustomException(ErrorCode.INVALID_DECREASE_AMOUNT);
        }
        if (medicine.getStock() < quantity) {
            throw new CustomException(ErrorCode.INSUFFICIENT_STOCK);
        }

        // 엔티티의 재고 차감 메서드 사용
        medicine.decreaseStock(quantity);
    }

    // 약품 재고 복구 (처방 취소 시 사용)
    @Transactional
    public void increaseStock(Long medicineId, Integer quantity) {
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEDICINE_NOT_FOUND));

        if (quantity <= 0) {
            throw new CustomException(ErrorCode.INVALID_INCREASE_AMOUNT);
        }

        // 엔티티의 재고 증가 메서드 사용
        medicine.increaseStock(quantity);
    }

    // 유저 권한 검증 (관리자만 가능)
    private User getUserAndValidateRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!user.getRole().equals(UserRole.ROLE_ADMIN)) {
            throw new CustomException(ErrorCode.NO_MEDICINE_MANAGE_PERMISSION);
        }

        if (user.getVetInfo() == null) {
            throw new CustomException(ErrorCode.VET_NOT_FOUND);
        }

        return user;
    }

    // 약품 접근 권한 검증
    private Medicine getMedicineAndValidateAccess(Long medicineId, VetInfo userVetInfo) {
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEDICINE_NOT_FOUND));

        if (!medicine.getVetInfo().getId().equals(userVetInfo.getId())) {
            throw new CustomException(ErrorCode.NO_MEDICINE_MANAGE_PERMISSION);
        }

        return medicine;
    }
}