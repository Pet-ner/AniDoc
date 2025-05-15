package com.petner.anidoc.domain.user.user.dto;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSignUpRequestDto {

    @NotBlank(message = "이름을 입력해주세요.")
    private String name;

    @NotBlank(message = "아이디를 입력해주세요.")

    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;

    private UserRole role;
    private String phoneNumber;
    private String emergencyContact;

    @Builder
    public User toEntity(){
        return User.builder()
                .name(name)
                .email(email)
                .password(password)
                .role(UserRole.ROLE_USER)
                .phoneNumber(phoneNumber)
                .emergencyContact(emergencyContact)
                .build();
    }

}
