package com.petner.anidoc.domain.user.notification.dto;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetInfoDto {
    private Long petId;
    private Long ownerId;
    private String name;
    private String species;
    private LocalDate birth;
    private LocalDate lastDiroDate;
    private boolean isDeceased;

    public static PetInfoDto from(Pet pet){
        return PetInfoDto.builder()
                .petId(pet.getId())
                .ownerId(pet.getOwner().getId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .birth(pet.getBirth())
                .lastDiroDate(pet.getLastDiroDate())
                .isDeceased(pet.isDeceased())
                .build();

    }

}
