package com.petner.anidoc.domain.vet.vaccination.service;

import com.petner.anidoc.domain.user.pet.dto.DoctorPetRequestDTO;
import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.pet.repository.PetRepository;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import com.petner.anidoc.domain.vet.reservation.repository.ReservationRepository;
import com.petner.anidoc.domain.vet.vaccination.dto.DoctorPetVaccinRequestDTO;
import com.petner.anidoc.domain.vet.vaccination.dto.DoctorPetVaccinResponseDTO;
import com.petner.anidoc.domain.vet.vaccination.entity.Vaccination;
import com.petner.anidoc.domain.vet.vaccination.repository.VaccinRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorPetVaccinService {
    private final VaccinRepository vaccinRepository;
    private final PetRepository petRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository; //? 필요할까?, 추후 생각다시해보기


    //등록
    @Transactional
    public Vaccination registerVaccination(Long petId, DoctorPetVaccinRequestDTO doctorPetVaccinRequestDTO, User doctor) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(()-> new EntityNotFoundException("존재하지 않는 반려동물입니다."));

        Reservation reservation = reservationRepository.findById(doctorPetVaccinRequestDTO.getReservationId())
                .orElseThrow(()-> new EntityNotFoundException("존재하지 않는 예약입니다."));

        Vaccination vaccination = Vaccination.builder()
                .doctor(doctor)
                .pet(pet)
                .reservation(reservation)
                .vaccineName(doctorPetVaccinRequestDTO.getVaccineName())
                .currentDose(doctorPetVaccinRequestDTO.getCurrentDose())
                .totalDoses(doctorPetVaccinRequestDTO.getTotalDoses())
                .nextDueDate(doctorPetVaccinRequestDTO.getNextDueDate())
                .status(doctorPetVaccinRequestDTO.getStatus())
                .notes(doctorPetVaccinRequestDTO.getNotes())
                .build();

        return vaccinRepository.save(vaccination);
    }
    //수정
    @Transactional
    public DoctorPetVaccinResponseDTO updateVaccin(Long vaccinationId, DoctorPetVaccinRequestDTO doctorPetVaccinRequestDTO){
        Vaccination vaccination = vaccinRepository.findById(vaccinationId)
                .orElseThrow(()-> new RuntimeException("예방접종 기록이 없습니다."));
        User doctor = userRepository.findById(doctorPetVaccinRequestDTO.getDoctorId())
                .orElseThrow(() -> new RuntimeException("의사 정보가 없습니다."));
        Reservation reservation = reservationRepository.findById(doctorPetVaccinRequestDTO.getReservationId())
                .orElseThrow(() -> new RuntimeException("예약 정보가 없습니다."));
        vaccination.updateVaccin(
                vaccination.getPet(),
                doctor,
                reservation,
                doctorPetVaccinRequestDTO
        );

//        return vaccination;
        return new DoctorPetVaccinResponseDTO(vaccination);
    }


    //전체 조회
    @Transactional(readOnly = true)
    public List<DoctorPetVaccinResponseDTO> findAllVaccinations() {
        List<Vaccination> vaccinations = vaccinRepository.findAll();
        return vaccinations.stream()
                .map(DoctorPetVaccinResponseDTO::new)
                .collect(Collectors.toList());
    }

    //상세 조회
    @Transactional(readOnly = true)
    public DoctorPetVaccinResponseDTO findVaccinationById(Long vaccinationId) {
        Vaccination vaccination = vaccinRepository.findById(vaccinationId)
                .orElseThrow(() -> new RuntimeException("예방접종 기록이 없습니다."));
        return new DoctorPetVaccinResponseDTO(vaccination);
    }
    //삭제
    @Transactional
    public void deleteVaccination(Long vaccinationId) {
        Vaccination vaccination = vaccinRepository.findById(vaccinationId)
                .orElseThrow(() -> new RuntimeException("예방접종 기록이 없습니다."));
        vaccinRepository.delete(vaccination);
    }

}
