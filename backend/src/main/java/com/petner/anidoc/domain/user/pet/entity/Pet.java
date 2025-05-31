package com.petner.anidoc.domain.user.pet.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.petner.anidoc.domain.user.pet.dto.DoctorPetRequestDTO;
import com.petner.anidoc.domain.user.pet.dto.OwnerPetRequestDTO;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import com.petner.anidoc.domain.vet.vaccination.entity.Vaccination;
import com.petner.anidoc.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

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

    @Column(length = 50) //종
    private String species;

    @Column(length = 50) //품종
    private String breed;

    private LocalDate birth;

    private BigDecimal weight;

    @Column(name = "is_neutered", nullable = false) //중성화 여부
    private Boolean isNeutered;

    @Column(name = "neutered_date") //중성화 날짜
    private LocalDate neuteredDate;

    @Column(name = "is_deceased", nullable = false) //사망 여부
    private Boolean isDeceased;

    @Column(name = "deceased_date") //사망 날짜
    private LocalDate deceasedDate;

    @Column(name = "surgery_count") //수술 횟수
    private Integer surgeryCount;

    @Column(name = "hospitalization_count") //입원 횟수
    private Integer hospitalizationCount;

    @Column(name = "last_diro_date") // 마지막 심장사상충 약 투여일
    private LocalDate lastDiroDate;

    @Column(name = "last_visit_date") //마지막 병원 방문일
    private LocalDate lastVisitDate;

    @Column(name = "profile_url")
    private String profileUrl;

    @Column(name = "special_note", columnDefinition = "TEXT") //특이사항
    private String specialNote;

    //Pet이 여러 개의 예약, 진료기록, 예방접종을 가질수있음
    @Builder.Default
    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL)
    private List<Reservation> reservations = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL)
    private List<MedicalRecord> medicalRecords = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL)
    private List<Vaccination> vaccinations = new ArrayList<>();

    public void updatePet(DoctorPetRequestDTO dto){
        this.name = dto.getName();
        this.gender = dto.getGender();
        this.species = dto.getSpecies();
        this.breed = dto.getBreed();
        this.birth = dto.getBirth();
        this.weight = dto.getWeight();
        // 중성화 여부 명시적 처리
        this.isNeutered = dto.getIsNeutered() != null ? dto.getIsNeutered() : false;
        this.lastDiroDate = dto.getLastDiroDate();
        this.specialNote = dto.getSpecialNote();

        this.neuteredDate = dto.getNeuteredDate();
        // 사망 여부 명시적 처리
        this.isDeceased = dto.getIsDeceased() != null ? dto.getIsDeceased() : false;
        this.deceasedDate = dto.getDeceasedDate();
        this.surgeryCount = dto.getSurgeryCount();
        this.hospitalizationCount = dto.getHospitalizationCount();
    }

    public void updatePet(OwnerPetRequestDTO dto){
        this.name = dto.getName();
        this.gender = dto.getGender();
        this.species = dto.getSpecies();
        this.breed = dto.getBreed();
        this.birth = dto.getBirth();
        this.weight = dto.getWeight();
        this.isNeutered = dto.getIsNeutered();
        this.lastDiroDate = dto.getLastDiroDate();
        this.profileUrl = dto.getProfileUrl();
        this.specialNote = dto.getSpecialNote();

    }
}
