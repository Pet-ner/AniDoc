package com.petner.anidoc.domain.user.pet.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    private Long id;

    private String name;

    private Gender gender;

//    @JsonProperty("isNeutered")
//    private boolean isNeutered;
    private Boolean isNeutered;

    private String species;

    private String breed;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate birth;

    private BigDecimal weight;

//    protected LocalDate lastVisitDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate lastDiroDate;

    private String profileUrl;

    private String specialNote;


    public OwnerPetResponseDTO(Pet pet){
        this.id = pet.getId();
        this.name = pet.getName();
        this.gender = pet.getGender();
        this.species = pet.getSpecies();
        this.breed = pet.getBreed();
        this.birth = pet.getBirth();
        this.weight = pet.getWeight();
        this.isNeutered = pet.getIsNeutered();
//        this.lastVisitDate = pet.getLastVisitDate();
        this.lastDiroDate = pet.getLastDiroDate();
        this.profileUrl = pet.getProfileUrl();
        this.specialNote = pet.getSpecialNote();
    }

}

