package com.petner.anidoc.domain.vet.vaccination.dto;

import com.petner.anidoc.domain.vet.vaccination.entity.Vaccination;
import com.petner.anidoc.domain.vet.vaccination.entity.VaccinationStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaccinationResponseDto {
    private Long id;

    private String petName;
    private String doctorName;
    private Long reservationId;

    private String vaccineName;
    private Integer currentDose;
    private Integer totalDoses;
    private LocalDate vaccinationDate;
    private VaccinationStatus status;
    private String notes;

    public static VaccinationResponseDto from(Vaccination vaccination) {
        return VaccinationResponseDto.builder()
                .id(vaccination.getId())
                .petName(vaccination.getPet().getName())
                .doctorName(vaccination.getDoctor().getName())
                .reservationId(vaccination.getReservation().getId())
                .vaccineName(vaccination.getVaccineName())
                .currentDose(vaccination.getCurrentDose())
                .totalDoses(vaccination.getTotalDoses())
                .vaccinationDate(vaccination.getVaccinationDate())
                .status(vaccination.getStatus())
                .notes(vaccination.getNotes())
                .build();
    }



}
