package com.petner.anidoc.domain.user.pet.service;

import com.petner.anidoc.domain.user.pet.dto.OwnerPetRequestDTO;
import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.pet.repository.PetRepository;
import com.petner.anidoc.domain.user.pet.repository.PetRepository;
import com.petner.anidoc.domain.user.user.entity.User;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OwnerPetRegistService {

    private final PetRepository petRepository;

    public OwnerPetRegistService(PetRepository petRepository) {
        this.petRepository = petRepository;
    }

    //등록
    @Transactional
    public Pet registerPet(OwnerPetRequestDTO ownerPetRequestdto, User owner) {
        Pet pet = Pet.builder()
                .owner(owner)
                .name(ownerPetRequestdto.getName())
                .gender(ownerPetRequestdto.getGender())
                .species(ownerPetRequestdto.getSpecies())
                .breed(ownerPetRequestdto.getBreed())
                .birth(ownerPetRequestdto.getBirth())
                .weight(ownerPetRequestdto.getWeight())
                .isNeutered(ownerPetRequestdto.getIsNeutered())
//                .lastVisitDate(ownerPetRequestdto.getLastVisitDate())
                .lastDiroDate(ownerPetRequestdto.getLastDiroDate())
                .profileUrl(ownerPetRequestdto.getProfileUrl()) //사진등록 추가
                .specialNote(ownerPetRequestdto.getSpecialNote())
                .build();

        return petRepository.save(pet);
    }

    //수정
    @Transactional
    public Pet updatePet(Long petId, OwnerPetRequestDTO dto, User owner) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("반려동물을 찾을 수 없습니다."));
        // 보호자 본인 소유의 반려동물인지 확인
        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        pet.updatePet(dto);
        return pet;
    }
    //전체 조회
    @Transactional(readOnly = true)
    public List<Pet> findAllPetsByOwner(Long ownerId){
        return petRepository.findByOwnerIdWithDetails(ownerId); //n+1 쿼리 문제 개선
    }
    //상세 조회
    @Transactional(readOnly = true)
    public Pet findPetByOwner(Long petId, Long ownerId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(()-> new EntityNotFoundException("반려동물을 찾을수 없습니다"));
        if (!pet.getOwner().getId().equals(ownerId)){
            throw new RuntimeException("조회 권한이 없습니다.");
        }
        return pet;
    }

    //삭제
    @Transactional
    public void deletePet(Long petId, User owner) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new EntityNotFoundException("반려동물을 찾을 수 없습니다."));
        // 소유자 확인
        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }
        petRepository.delete(pet);
    }
}
