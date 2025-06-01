package com.petner.anidoc.domain.user.user.dto;

import com.petner.anidoc.domain.user.user.entity.ApprovalStatus;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.entity.UserStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponseDto {


    private String accessToken;
    private Long userId;

}
