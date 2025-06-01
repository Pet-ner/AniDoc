package com.petner.anidoc.domain.vet.vaccination.dto;

import com.petner.anidoc.domain.vet.vaccination.entity.VaccinationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class VaccinationRequestDto {
    private Long petId;
    private Long reservationId;
    private String vaccineName;
    private Integer currentDose;
    private Integer totalDoses;
    private LocalDate vaccinationDate;
    private VaccinationStatus status;
    private String notes;


}
