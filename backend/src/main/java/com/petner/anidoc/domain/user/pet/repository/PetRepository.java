package com.petner.anidoc.domain.user.pet.repository;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwnerId(Long ownerId);

    //살아있는 반려동물 조회
    List<Pet> findByIsDeceasedFalse();

}
