package com.petner.anidoc.domain.vet.vaccination.entity;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
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
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(name = "vaccine_name", nullable = false, length = 100)
    private String vaccineName;

    @Column(name = "current_dose", nullable = false)
    private Integer currentDose;

    @Column(name = "total_doses", nullable = false)
    private Integer totalDoses;

    @Column(name = "vaccination_date")
    private LocalDate vaccinationDate;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VaccinationStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
