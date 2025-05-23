package com.petner.anidoc.domain.user.pet.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
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
public class DoctorPetRequestDTO{
    @NotBlank(message = "반려동물의 이름을 입력하세요")
    private String name;

    private Gender gender;

    @NotNull(message = "중성화 여부를 선택하세요.")
    private boolean isNeutered;

    private String species;

    private String breed;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate birth;

    private BigDecimal weight;

//    private LocalDate lastVisitDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate lastDiroDate;

    @Size(message = "반려동물의 특이사항 입력해주세요.(알러지, 질병 등)")
    private String specialNote;
    private LocalDate neuteredDate;     //중성화 일자
    private Boolean isDeceased;     //사명여부
    private LocalDate deceasedDate;     //사명일자
    private Integer surgeryCount;     //수술횟수
    private Integer hospitalizationCount;     //입원횟수
    private LocalDate lastVisitDate;     //마지막내원일자
}
