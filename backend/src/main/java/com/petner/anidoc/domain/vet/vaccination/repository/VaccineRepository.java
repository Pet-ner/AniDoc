package com.petner.anidoc.domain.vet.vaccination.repository;

import com.petner.anidoc.domain.vet.vaccination.entity.Vaccination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface VaccineRepository extends JpaRepository<Vaccination, Long>{
    List<Vaccination> findByPetOwnerId(Long ownerId);
}
