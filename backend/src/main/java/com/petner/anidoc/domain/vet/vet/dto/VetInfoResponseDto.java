package com.petner.anidoc.domain.vet.vet.dto;

import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VetInfoResponseDto {
    private Long id;
    private String vetName;
    private String vetNumber;
    private String vetAddress;
    private LocalDate establishedDate;

    public static VetInfoResponseDto fromEntity(VetInfo vetInfo) {
        return VetInfoResponseDto.builder()
                .id(vetInfo.getId())
                .vetName(vetInfo.getVetName())
                .vetNumber(vetInfo.getVetNumber())
                .vetAddress(vetInfo.getVetAddress())
                .establishedDate(vetInfo.getEstablishedDate())
                .build();
    }
}