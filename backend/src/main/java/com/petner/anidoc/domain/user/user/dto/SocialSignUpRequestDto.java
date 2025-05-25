package com.petner.anidoc.domain.user.user.dto;

import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder

public class SocialSignUpRequestDto {
        private String name;
        private String phoneNumber;
        private String emergencyContact;
        private Long vetInfoId;

    }
