package com.petner.anidoc.domain.vet.vet.entity;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.vet.medicine.entity.Medicine;
import com.petner.anidoc.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
@Table(name = "vet_info")
public class VetInfo extends BaseEntity {
    @Column(name = "vet_name", length = 100)
    private String vetName;

    @Column(name = "vet_number")
    private String vetNumber;

    @Column(name = "vet_address")
    private String vetAddress;

    @Column(name = "established_date")
    private LocalDate establishedDate;

    @Builder.Default
    @OneToMany(mappedBy = "vetInfo", cascade = CascadeType.ALL)
    private List<User> users = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "vetInfo", cascade = CascadeType.ALL)
    private List<Medicine> medicines = new ArrayList<>();
}
