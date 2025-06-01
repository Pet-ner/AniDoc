package com.petner.anidoc.domain.vet.vaccination.entity;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import com.petner.anidoc.domain.vet.vaccination.dto.DoctorPetVaccineRequestDTO;
import com.petner.anidoc.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
@Table(name = "vaccinations")
public class Vaccination extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet; //반려동물

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor; //담당한 의사

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation; //예방접종이 연결된 예약

    @Column(name = "vaccine_name", nullable = false, length = 100)
    private String vaccineName;

    @Column(name = "current_dose", nullable = false)
    private Integer currentDose; //몇번째 접종인지

    @Column(name = "total_doses", nullable = false)
    private Integer totalDoses; //총 몇번 맞아야하는지

    @Column(name = "vaccination_date")
    private LocalDate vaccinationDate; //접종일

    @Column(name = "next_due_date")
    private LocalDate nextDueDate; //다음접종일

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VaccinationStatus status; //접종상태(미접종, 접종진행중(2차까지맞고, 3차가 남은경우), 모든접종완료)

    @Column(columnDefinition = "TEXT")
    private String notes; //메모

    public void updateVaccine (
            Pet pet,
            User doctor,
            Reservation reservation,
            DoctorPetVaccineRequestDTO dto){
        this.pet = pet;
        this.doctor = doctor;
        this.reservation = reservation;
        this.vaccineName = dto.getVaccineName();
        this.currentDose = dto.getCurrentDose();
        this.totalDoses = dto.getTotalDoses();
        this.vaccinationDate = dto.getVaccinationDate();
        this.nextDueDate = dto.getNextDueDate();
        this.status = dto.getStatus();
        this.notes = dto.getNotes();
    }
}
