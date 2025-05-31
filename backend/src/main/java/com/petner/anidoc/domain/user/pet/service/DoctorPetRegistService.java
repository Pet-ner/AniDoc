package com.petner.anidoc.domain.user.pet.service;

import com.petner.anidoc.domain.user.pet.dto.DoctorPetRequestDTO;
import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.pet.repository.PetRepository;
import com.petner.anidoc.domain.user.user.entity.User;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DoctorPetRegistService {
    private final PetRepository petRepository;

    public DoctorPetRegistService(PetRepository petRepository) {
        this.petRepository = petRepository;
    }

    @Transactional
    public Pet updatePet(Long petId, DoctorPetRequestDTO dto) {
        Pet pet = petRepository.findByIdWithOwnerAndMedicalRecords(petId)
                .orElseThrow(() -> new EntityNotFoundException("반려동물을 찾을수없어요"));
        pet.updatePet(dto);
        return petRepository.save(pet);
    }

    // 전체조회 - 보호자 정보와 진료 기록 포함
    @Transactional(readOnly = true)
    public List<Pet> findAllPets(){
        return petRepository.findAllWithOwnersAndMedicalRecords();
    }

    // 상세 조회 - 보호자 정보와 진료 기록 포함
    @Transactional(readOnly = true)
    public Pet findPetByDoctor(Long petId){
        return petRepository.findByIdWithOwnerAndMedicalRecords(petId)
                .orElseThrow(()-> new EntityNotFoundException("반려동물을 찾을수 없습니다."));
    }

    @Transactional
    public void deletePet(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new EntityNotFoundException("반려동물을 찾을 수 없습니다."));
        petRepository.delete(pet);
    }
}

