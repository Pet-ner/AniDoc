package com.petner.anidoc.domain.vet.prescription.entity;

import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.medicine.entity.Medicine;
import com.petner.anidoc.domain.vet.prescription.dto.PrescriptionRequestDto;
import com.petner.anidoc.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
@Table(name = "prescriptions")
public class Prescription extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private MedicalRecord medicalRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    private Integer quantity;

    @Column(length = 100)
    private String dosage;

    // 처방전 정보 업데이트 메서드
    public void updateFromDto(PrescriptionRequestDto dto, Medicine newMedicine) {
        this.medicine = newMedicine;
        this.quantity = dto.getQuantity();
        this.dosage = dto.getDosage();
    }

}
