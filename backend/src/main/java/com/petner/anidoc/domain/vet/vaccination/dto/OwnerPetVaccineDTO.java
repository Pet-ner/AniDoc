package com.petner.anidoc.domain.vet.vaccination.dto;

import com.petner.anidoc.domain.vet.vaccination.entity.Vaccination;
import com.petner.anidoc.domain.vet.vaccination.entity.VaccinationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerPetVaccineDTO {
    private Long vaccinationId;
    private String petName;
    private String vaccineName;
    private Integer currentDose;
    private Integer totalDoses;
    private LocalDate vaccinationDate;
    private LocalDate nextDueDate;
    private VaccinationStatus status;
    private String notes;

    public OwnerPetVaccineDTO(Vaccination vaccination){
        this.vaccinationId = vaccination.getId();
        this.petName = vaccination.getPet().getName();
        this.vaccineName = vaccination.getVaccineName();
        this.currentDose = vaccination.getCurrentDose();
        this.totalDoses = vaccination.getTotalDoses();
        this.vaccinationDate = vaccination.getVaccinationDate();
        this.nextDueDate = vaccination.getNextDueDate();
        this.status = vaccination.getStatus();
        this.notes = vaccination.getNotes();
    }

}
