package com.petner.anidoc.domain.user.user.dto;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSignUpRequestDto {

    @NotBlank(message = "이름을 입력해주세요.")
    private String name;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;

    @Builder.Default
    private UserRole role = UserRole.ROLE_USER;
    private String phoneNumber;
    private String emergencyContact;

    @NotNull(message = "병원 정보는 필수입니다.")
    private Long vetInfoId; // 소속 병원 ID

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
