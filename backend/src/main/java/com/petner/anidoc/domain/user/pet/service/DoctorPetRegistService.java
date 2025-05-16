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
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new EntityNotFoundException("반려동물을 찾을수없어요"));

        pet.updatePet(dto);
        return pet;
    }
    //전체조회
    @Transactional(readOnly = true)
    public List<Pet> findAllPets(){
        return petRepository.findAll();
    }


    //상세 조회
    @Transactional(readOnly = true)
    public Pet findPetByDoctor(Long petId){
        return petRepository.findById(petId)
                .orElseThrow(()-> new EntityNotFoundException("반려동물을 찾을수 없습니다."));
    }

}

