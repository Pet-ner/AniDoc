package com.petner.anidoc.domain.vet.hospitalizationrecord.entity;

import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.vet.hospitalizationrecord.dto.HospitalizationRecordRequestDto;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
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
@Table(name = "hospitalization_records")
public class HospitalizationRecord extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private MedicalRecord medicalRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Column(name = "admission_date")
    private LocalDate admissionDate;

    @Column(name = "discharge_date")
    private LocalDate dischargeDate;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "image_url")
    private String imageUrl;

    @Builder.Default
    @Column(name="is_deleted")
    private Boolean isDeleted = false;

    public void markAsDeleted(){
        this.isDeleted=true;
    }

    public void updateFromDto(HospitalizationRecordRequestDto dto) {
        this.admissionDate = dto.getAdmissionDate();
        this.dischargeDate = dto.getDischargeDate();
        this.reason = dto.getReason();
        this.imageUrl = dto.getImageUrl();
    }



}
