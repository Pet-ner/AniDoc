package com.petner.anidoc.domain.user.pet.dto;

import com.petner.anidoc.domain.user.pet.entity.Gender;
import com.petner.anidoc.domain.user.pet.entity.Pet;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class OwnerPetResponseDTO {
    private String name;

    private Gender gender;

    private boolean isNeutered;

    private String species;

    private String breed;

    private LocalDate birth;

    private BigDecimal weight;

//    protected LocalDate lastVisitDate;

    private String specialNote;

    public OwnerPetResponseDTO(Pet pet){
        this.name = pet.getName();
        this.gender = pet.getGender();
        this.species = pet.getSpecies();
        this.breed = pet.getBreed();
        this.birth = pet.getBirth();
        this.weight = pet.getWeight();
        this.isNeutered = pet.isNeutered();
//        this.lastVisitDate = pet.getLastVisitDate();
        this.specialNote = pet.getSpecialNote();
    }

}

