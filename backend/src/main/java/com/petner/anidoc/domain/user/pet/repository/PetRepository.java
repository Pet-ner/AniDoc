package com.petner.anidoc.domain.user.pet.repository;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PetRepository extends JpaRepository<Pet, Long> {
}
