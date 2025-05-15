package com.petner.anidoc.domain.user.pet.dto;

import com.petner.anidoc.domain.user.pet.entity.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
@Getter
@Setter
@NoArgsConstructor
public class OwnerPetRequestDTO {
    @NotBlank(message = "반려동물의 이름을 입력하세요")
    private String name;

    private Gender gender;

    @NotNull(message = "중성화 여부를 선택하세요.")
    private boolean isNeutered;

    private String species;

    private String breed;

    private LocalDate birth;

    private BigDecimal weight;

//    private LocalDate lastVisitDate;

    @Size(max = 1000, message = "특이사항은 1000자 이내로 입력하세요.")
    private String specialNote;

}
