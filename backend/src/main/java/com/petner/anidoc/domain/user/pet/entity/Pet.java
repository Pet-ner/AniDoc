package com.petner.anidoc.domain.user.pet.entity;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.vet.hospitalization.entity.Hospitalization;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import com.petner.anidoc.domain.vet.surgery.entity.Surgery;
import com.petner.anidoc.domain.vet.vaccination.entity.Vaccination;
import com.petner.anidoc.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
@Table(name = "pets")
public class Pet extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(length = 50)
    private String species;

    @Column(length = 50)
    private String breed;

    private LocalDate birth;

    private BigDecimal weight;

    @Column(name = "is_neutered", nullable = false)
    private boolean isNeutered;

    @Column(name = "neutered_date")
    private LocalDate neuteredDate;

    @Column(name = "is_deceased", nullable = false)
    private boolean isDeceased;

    @Column(name = "deceased_date")
    private LocalDate deceasedDate;

    @Column(name = "surgery_count")
    private Integer surgeryCount;

    @Column(name = "hospitalization_count")
    private Integer hospitalizationCount;

    @Column(name = "last_diro_date")
    private LocalDate lastDiroDate;

    @Column(name = "last_visit_date")
    private LocalDate lastVisitDate;

    @Builder.Default
    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL)
    private List<Reservation> reservations = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL)
    private List<MedicalRecord> medicalRecords = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL)
    private List<Vaccination> vaccinations = new ArrayList<>();

}
