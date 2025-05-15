package com.petner.anidoc.domain.vet.surgeryrecord.entity;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.surgeryrecord.dto.SurgeryRecordRequestDto;
import com.petner.anidoc.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
@Table(name = "surgery_records")
public class SurgeryRecord extends BaseEntity {
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

    @Enumerated(EnumType.STRING)
    @Column(name = "anesthesia_type", length = 100)
    private AnesthesiaType anesthesiaType; //마취 종류

    @Column(name = "surgery_note", columnDefinition = "TEXT")
    private String surgeryNote;

    @Builder.Default
    @Column(name="is_deleted")
    private Boolean isDeleted = false;

    public void markAsDeleted(){
        this.isDeleted=true;
    }

    public void updateFromDto(SurgeryRecordRequestDto dto) {
        this.surgeryName = dto.getSurgeryName();
        this.surgeryDate = dto.getSurgeryDate();
        this.anesthesiaType = dto.getAnesthesiaType();
        this.surgeryNote = dto.getSurgeryNote();
    }

}
