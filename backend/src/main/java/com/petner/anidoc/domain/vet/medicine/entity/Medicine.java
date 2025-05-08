package com.petner.anidoc.domain.vet.medicine.entity;

import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
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
@Table(name = "medicines")
public class Medicine extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vet_id", nullable = false)
    private VetInfo vetInfo;

    @Column(name = "medication_name", nullable = false, length = 100)
    private String medicationName;

    private Integer stock;

}
