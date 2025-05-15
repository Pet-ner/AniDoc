package com.petner.anidoc.domain.user.pet.service;

import com.petner.anidoc.domain.user.pet.dto.DoctorPetRequestDTO;
import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.pet.repository.PetRepository;
import com.petner.anidoc.domain.user.user.entity.User;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DoctorPetRegistService {
    private final PetRepository petRepository;

    public DoctorPetRegistService(PetRepository petRepository) {
        this.petRepository = petRepository;
    }

    @Transactional
    public Pet registerPet(DoctorPetRequestDTO doctorPetRequestDTO, User isadmin) {
        Pet pet = Pet.builder()
                .neuteredDate(doctorPetRequestDTO.getNeuteredDate())
                .isDeceased(doctorPetRequestDTO.isDeceased())
                .deceasedDate(doctorPetRequestDTO.getDeceasedDate())
                .surgeryCount(doctorPetRequestDTO.getSurgeryCount())
                .hospitalizationCount(doctorPetRequestDTO.getHospitalizationCount())
                .lastVisitDate(doctorPetRequestDTO.getLastVisitDate())
                .build();
        return petRepository.save(pet);
    }
    @Transactional
    public Pet updatePet(Long petId, DoctorPetRequestDTO dto) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new EntityNotFoundException("반려동물을 찾을수없어요"));

        pet.updatePet(dto);
        return pet;
    }
}

