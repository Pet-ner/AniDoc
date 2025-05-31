package com.petner.anidoc.domain.user.user.dto;

import lombok.Data;
import lombok.Getter;

@Data
@Getter

public class PasswordVerificationRequest {

    private String password;
}
