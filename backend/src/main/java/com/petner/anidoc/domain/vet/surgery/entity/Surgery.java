package com.petner.anidoc.domain.vet.surgery.entity;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
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
@Table(name = "surgeries")
public class Surgery extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private MedicalRecord medicalRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Column(name = "surgery_name", length = 100)
    private String surgeryName;

    @Column(name = "surgery_date")
    private LocalDate surgeryDate;

    @Column(name = "anesthesia_type", length = 100)
    private String anesthesiaType;

    @Column(name = "surgery_note", columnDefinition = "TEXT")
    private String surgeryNote;
}
