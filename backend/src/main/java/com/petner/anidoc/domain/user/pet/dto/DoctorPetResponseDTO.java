package com.petner.anidoc.domain.user.pet.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.petner.anidoc.domain.user.pet.entity.Gender;
import com.petner.anidoc.domain.user.pet.entity.Pet;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
public class DoctorPetResponseDTO {
    private Long id;
    private String name;
    private Gender gender;
    private Boolean isNeutered;
    private String species;
    private String breed;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate birth;

    private BigDecimal weight;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate lastDiroDate;

    private String specialNote;
    private LocalDate neuteredDate;
    private Boolean isDeceased;
    private LocalDate deceasedDate;
    private Integer surgeryCount;
    private Integer hospitalizationCount;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate lastVisitDate;

    // 보호자 정보 추가
    private OwnerInfo owner;

    public DoctorPetResponseDTO(Pet pet){
        this.id = pet.getId();
        this.name = pet.getName();
        this.gender = pet.getGender();
        this.species = pet.getSpecies();
        this.breed = pet.getBreed();
        this.birth = pet.getBirth();
        this.weight = pet.getWeight();
        this.lastDiroDate = pet.getLastDiroDate();
        this.isNeutered = pet.getIsNeutered() != null ? pet.getIsNeutered() : false;
        this.specialNote = pet.getSpecialNote();
        this.neuteredDate = pet.getNeuteredDate();
        this.isDeceased = pet.getIsDeceased() != null ? pet.getIsDeceased() : false;
        this.deceasedDate = pet.getDeceasedDate();
        this.surgeryCount = pet.getSurgeryCount();
        this.hospitalizationCount = pet.getHospitalizationCount();

        // 마지막방문일을 진료기록에서 자동 계산
        this.lastVisitDate = calculateLastVisitDateFromMedicalRecords(pet);

        // 보호자 정보 매핑
        if (pet.getOwner() != null) {
            this.owner = new OwnerInfo(pet.getOwner().getId(), pet.getOwner().getName());
        }
    }

    // 진료기록에서 마지막방문일 계산하는 메서드
    private LocalDate calculateLastVisitDateFromMedicalRecords(Pet pet) {
        if (pet.getMedicalRecords() == null || pet.getMedicalRecords().isEmpty()) {
            return pet.getLastVisitDate(); // 기존 값 반환
        }

        return pet.getMedicalRecords().stream()
                .filter(mr -> mr.getReservation() != null) // 예약이 있는 진료 기록만
                .filter(mr -> !mr.getIsDeleted()) // 삭제되지 않은 기록만
                .map(mr -> mr.getReservation().getReservationDate()) // 예약 날짜
                .filter(Objects::nonNull)
                .max(LocalDate::compareTo)
                .orElse(pet.getLastVisitDate()); // 계산 실패 시 기존 값
    }

    @Getter
    @AllArgsConstructor
    public static class OwnerInfo {
        private Long id;
        private String name;
    }
}

