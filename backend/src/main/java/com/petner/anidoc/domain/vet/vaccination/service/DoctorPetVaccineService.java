package com.petner.anidoc.domain.vet.vaccination.service;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.pet.repository.PetRepository;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import com.petner.anidoc.domain.vet.reservation.repository.ReservationRepository;
import com.petner.anidoc.domain.vet.vaccination.dto.DoctorPetVaccineRequestDTO;
import com.petner.anidoc.domain.vet.vaccination.dto.DoctorPetVaccineResponseDTO;
import com.petner.anidoc.domain.vet.vaccination.dto.VaccinationStatusDto;
import com.petner.anidoc.domain.vet.vaccination.entity.Vaccination;
import com.petner.anidoc.domain.vet.vaccination.entity.VaccinationStatus;
import com.petner.anidoc.domain.vet.vaccination.repository.VaccinationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorPetVaccineService {
    private final VaccinationRepository vaccineRepository;
    private final PetRepository petRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;


    //등록
    @Transactional
    public Vaccination registerVaccination(Long petId, DoctorPetVaccineRequestDTO doctorPetVaccineRequestDTO, User doctor) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(()-> new EntityNotFoundException("존재하지 않는 반려동물입니다."));

//        Reservation reservation = reservationRepository.findById(doctorPetVaccineRequestDTO.getReservationId())
//                .orElseThrow(()-> new EntityNotFoundException("존재하지 않는 예약입니다."));
        Reservation reservation = reservationRepository.findById(doctorPetVaccineRequestDTO.getReservationId())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 예약입니다."));
        if (!reservation.getPet().getId().equals(petId)) {
            throw new IllegalArgumentException("해당 예약은 이 반려동물의 예약이 아닙니다.");
        }

        if (vaccinationRepository.findByReservationId(doctorPetVaccineRequestDTO.getReservationId()).isPresent()) {
            throw new IllegalStateException("이미 해당 예약에 대한 예방접종 기록이 존재합니다.");
        }

        Vaccination vaccination = Vaccination.builder()
                .doctor(doctor)
                .pet(pet)
                .reservation(reservation)
                .vaccineName(doctorPetVaccineRequestDTO.getVaccineName())
                .currentDose(doctorPetVaccineRequestDTO.getCurrentDose())
                .totalDoses(doctorPetVaccineRequestDTO.getTotalDoses())
                .vaccinationDate(reservation.getReservationDate()) // 예약일로 자동 설정
                .nextDueDate(null) // 다음 접종일은 설정하지 않음
                .status(VaccinationStatus.NOT_STARTED)
                .notes(doctorPetVaccineRequestDTO.getNotes())
                .build();

        return vaccineRepository.save(vaccination);
    }
    //수정
    @Transactional
    public DoctorPetVaccineResponseDTO updateVaccine(Long vaccinationId, DoctorPetVaccineRequestDTO doctorPetVaccineRequestDTO, User currentDoctor){
        Vaccination vaccination = vaccineRepository.findById(vaccinationId)
                .orElseThrow(()-> new RuntimeException("예방접종 기록이 없습니다."));
        //권한(동일한 의료진인지 확인)
        if (!vaccination.getDoctor().getId().equals(currentDoctor.getId())) {
            throw new AccessDeniedException("본인이 등록한 예방접종만 수정할 수 있습니다.");
        }
        User doctor = userRepository.findById(doctorPetVaccineRequestDTO.getDoctorId())
                .orElseThrow(() -> new RuntimeException("의사 정보가 없습니다."));
        Reservation reservation = reservationRepository.findById(doctorPetVaccineRequestDTO.getReservationId())
                .orElseThrow(() -> new RuntimeException("예약 정보가 없습니다."));
        vaccination.updateVaccine(
                vaccination.getPet(),
                doctor,
                reservation,
                doctorPetVaccineRequestDTO
        );

        return new DoctorPetVaccineResponseDTO(vaccination);
    }


    //전체 조회
    @Transactional(readOnly = true)
    public List<DoctorPetVaccineResponseDTO> findAllVaccinations() {
        List<Vaccination> vaccinations = vaccineRepository.findAll();
        return vaccinations.stream()
                .map(DoctorPetVaccineResponseDTO::new)
                .collect(Collectors.toList());
    }

    //상세 조회
    @Transactional(readOnly = true)
    public DoctorPetVaccineResponseDTO findVaccinationById(Long vaccinationId) {
        Vaccination vaccination = vaccineRepository.findById(vaccinationId)
                .orElseThrow(() -> new RuntimeException("예방접종 기록이 없습니다."));
        return new DoctorPetVaccineResponseDTO(vaccination);
    }

    // 예약별 예방접종 기록 조회
    @Transactional(readOnly = true)
    public DoctorPetVaccineResponseDTO findVaccinationByReservationId(Long reservationId) {
        Vaccination vaccination = vaccinationRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("해당 예약에 대한 예방접종 기록이 없습니다."));
        return new DoctorPetVaccineResponseDTO(vaccination);
    }

    //삭제
    @Transactional
    public void deleteVaccination(Long vaccinationId, User currentDoctor) {
        Vaccination vaccination = vaccineRepository.findById(vaccinationId)
                .orElseThrow(() -> new RuntimeException("예방접종 기록이 없습니다."));
        //권한(동일한 의료진인지 확인)
        if (!vaccination.getDoctor().getId().equals(currentDoctor.getId())){
            throw new AccessDeniedException("본인이 등록한 예방접종만 삭제할 수 있습니다.");
        }

        vaccineRepository.delete(vaccination);
    }

    @Transactional(readOnly = true)
    public VaccinationStatusDto getVaccinationStatusByReservationId(Long reservationId) {
        Optional<Vaccination> vaccination = vaccinationRepository.findByReservationId(reservationId);
        return vaccination.map(value -> new VaccinationStatusDto(true, value.getStatus().toString()))
                .orElseGet(() -> new VaccinationStatusDto(false, null));
    }
}
