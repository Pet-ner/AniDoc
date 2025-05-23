package com.petner.anidoc.domain.user.user.dto;

import com.petner.anidoc.domain.user.user.entity.User;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Builder

public class SocialSignUpResponseDto {
        private String name;
        private String email;
        private String phoneNumber;
        private String emergencyContact;
        private String role;
        private String vetInfo;

    }
