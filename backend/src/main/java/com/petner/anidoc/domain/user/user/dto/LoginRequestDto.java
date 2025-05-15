package com.petner.anidoc.domain.user.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequestDto {

    // 로그인 시 요구하는 입력값
    private String email;
    private String password;
}
