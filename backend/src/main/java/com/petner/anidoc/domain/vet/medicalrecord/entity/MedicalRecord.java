package com.petner.anidoc.domain.vet.medicalrecord.entity;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.vet.checkup.entity.CheckupResult;
import com.petner.anidoc.domain.vet.hospitalization.entity.Hospitalization;
import com.petner.anidoc.domain.vet.medicalrecord.dto.MedicalRecordRequestDto;
import com.petner.anidoc.domain.vet.prescription.entity.Prescription;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import com.petner.anidoc.domain.vet.surgery.entity.Surgery;
import com.petner.anidoc.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.Where;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
@Where(clause = "is_deleted = false")
@Table(name = "medical_records")
public class MedicalRecord extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Column(name = "current_weight")
    private BigDecimal currentWeight;

    private Integer age;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String treatment;

    @Builder.Default
    @Column(name = "is_surgery")
    private Boolean isSurgery=false;

    @Builder.Default
    @Column(name = "is_hospitalized")
    private Boolean isHospitalized=false;

    @Builder.Default
    @Column(name="is_checked_up")
    private Boolean isCheckedUp=false;

    @Builder.Default
    @Column(name="is_deleted")
    private Boolean isDeleted = false;

    @Enumerated(EnumType.STRING)
    @Column(name="update_status")
    private UpdateStatus updateStatus = UpdateStatus.NOT_EDITED;

    @Builder.Default
    @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL,orphanRemoval = true)
    private List<CheckupResult> checkupResults = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Prescription> prescriptions = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Surgery> surgeries = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Hospitalization> hospitalizations = new ArrayList<>();


    public void updateFromDto(MedicalRecordRequestDto dto) {
        this.age = dto.getAge();
        this.currentWeight = dto.getCurrentWeight();
        this.diagnosis = dto.getDiagnosis();
        this.treatment = dto.getTreatment();
        this.isSurgery = dto.isSurgery();
        this.isHospitalized = dto.isHospitalized();
        this.isCheckedUp = dto.isCheckedUp();
        this.updateStatus = UpdateStatus.EDITED;
    }


}
