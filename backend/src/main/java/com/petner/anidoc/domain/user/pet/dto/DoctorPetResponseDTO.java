package com.petner.anidoc.domain.user.pet.dto;

import com.petner.anidoc.domain.user.pet.entity.Gender;
import com.petner.anidoc.domain.user.pet.entity.Pet;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
@Getter
@Setter
@NoArgsConstructor
public class DoctorPetResponseDTO {
    private String name;

    private Gender gender;

    private boolean isNeutered;

    private String species;

    private String breed;

    private LocalDate birth;

    private BigDecimal weight;

//    protected LocalDate lastVisitDate;

    private String specialNote;
    private LocalDate neuteredDate;
    private boolean isDeceased;
    private LocalDate deceasedDate;
    private Integer surgeryCount;
    private Integer hospitalizationCount;
    private LocalDate lastVisitDate;

    public DoctorPetResponseDTO(Pet pet){
        this.name = pet.getName();
        this.gender = pet.getGender();
        this.species = pet.getSpecies();
        this.breed = pet.getBreed();
        this.birth = pet.getBirth();
        this.weight = pet.getWeight();
        this.isNeutered = pet.isNeutered();
        this.specialNote = pet.getSpecialNote();
        this.neuteredDate = pet.getNeuteredDate();
        this.isDeceased = pet.isDeceased();
        this.deceasedDate = pet.getDeceasedDate();
        this.surgeryCount = pet.getSurgeryCount();
        this.hospitalizationCount = pet.getHospitalizationCount();
        this.lastVisitDate = pet.getLastVisitDate();
    }
}
