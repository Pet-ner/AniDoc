package com.petner.anidoc.domain.vet.medicalrecord.service;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.medicalrecord.dto.MedicalRecordRequestDto;
import com.petner.anidoc.domain.vet.medicalrecord.dto.MedicalRecordResponseDto;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.medicalrecord.entity.UpdateStatus;
import com.petner.anidoc.domain.vet.medicalrecord.repository.MedicalRecordRepository;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import com.petner.anidoc.domain.vet.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;

@Service
@Slf4j
@RequiredArgsConstructor

public class MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;

    @Transactional
    public MedicalRecordResponseDto createMedicalRecord(MedicalRecordRequestDto medicalRecordRequestDto, Long userId, Long reservationId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(()-> new IllegalArgumentException("해당 예약건이 존재하지 않습니다."));

        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("진료 기록을 작성할 권한이 없습니다.");
        }

        medicalRecordRepository.findByReservationIdAndIsDeletedFalse(reservationId)
                .ifPresent(r -> {
                    throw new IllegalStateException("이미 해당 예약에 대한 진료기록이 존재합니다.");
                });

        MedicalRecord medicalRecord = MedicalRecord.builder()
                .pet(reservation.getPet())
                .reservation(reservation)
                .doctor(user)
                .currentWeight(medicalRecordRequestDto.getCurrentWeight())
                .age(medicalRecordRequestDto.getAge())
                .diagnosis(medicalRecordRequestDto.getDiagnosis())
                .treatment(medicalRecordRequestDto.getTreatment())
                .isSurgery(medicalRecordRequestDto.isSurgery())
                .isHospitalized(medicalRecordRequestDto.isHospitalized())
                .isCheckedUp(medicalRecordRequestDto.isCheckedUp())
                .build();

        MedicalRecord savedRecord = medicalRecordRepository.save(medicalRecord);
        return MedicalRecordResponseDto.from(savedRecord);
    }

    @Transactional
    public MedicalRecordResponseDto getMedicalRecord(Long userId, Long medicalRecordId){

        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndIsDeletedFalse(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않거나 삭제되었습니다."));

        return MedicalRecordResponseDto.from(medicalRecord);
    }

    @Transactional
    public void deleteMedicalRecord(Long medicalRecordId, Long userId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndIsDeletedFalse(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않거나 이미 삭제되었습니다."));

        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("진료 기록을 삭제할 권한이 없습니다.");
        }

        medicalRecord.markAsDeleted(); //soft delete
        medicalRecordRepository.save(medicalRecord);
    }

    @Transactional
    public MedicalRecordResponseDto updateMedicalRecord(Long userId, Long medicalRecordId, MedicalRecordRequestDto medicalRecordRequestDto) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        if(!user.getRole().equals(UserRole.ROLE_STAFF)){
            throw new AccessDeniedException("진료 기록을 수정할 권한이 없습니다.");
        }

        MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndIsDeletedFalse(medicalRecordId)
                .orElseThrow(()-> new IllegalArgumentException("해당 진료기록이 존재하지 않거나 삭제되었습니다."));

        medicalRecord.updateFromDto(medicalRecordRequestDto);
        return MedicalRecordResponseDto.from(medicalRecord);


    }

    @Transactional
    public MedicalRecord getMedicalRecordByReservationId(Long reservationId, Long userId) throws AccessDeniedException {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        MedicalRecord record = medicalRecordRepository.findWithAllDetailsByReservationId(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("해당 예약에 대한 진료기록이 존재하지 않습니다."));


        Long reservationOwnerId = record.getReservation().getUser().getId();

        if (!reservationOwnerId.equals(userId)
                && user.getRole() != UserRole.ROLE_STAFF
                && user.getRole() != UserRole.ROLE_ADMIN) {
            throw new AccessDeniedException("진료기록 조회 권한이 없습니다.");
        }

        return record;

    }




}
