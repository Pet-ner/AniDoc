package com.petner.anidoc.domain.vet.vaccination.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VaccinationStatusDto {
    private boolean exists;
    private String status;
}