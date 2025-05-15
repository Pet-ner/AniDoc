package com.petner.anidoc.domain.user.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponseDto {


    private String accessToken;
    private Long userId;

}
