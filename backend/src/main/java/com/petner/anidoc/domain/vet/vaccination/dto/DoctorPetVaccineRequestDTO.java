package com.petner.anidoc.domain.vet.vaccination.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.petner.anidoc.domain.vet.vaccination.entity.VaccinationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorPetVaccineRequestDTO {

    @NotNull
    private Long doctorId; // 담당 의사

    @NotNull
    private Long reservationId; // 연결된 예약

    @NotBlank
    private String vaccineName;

    @NotNull
    private Integer currentDose; //몇번째 접종인지

    @NotNull
    private Integer totalDoses; //총 몇번 맞아야하는지

    @JsonFormat(pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate vaccinationDate; //접종일

    @JsonFormat(pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate nextDueDate; //다음접종일

    @NotNull
    private VaccinationStatus status; //접종상태(미접종, 접종진행중(2차까지맞고, 3차가 남은경우), 모든접종완료)

    private String notes; //메모
}
