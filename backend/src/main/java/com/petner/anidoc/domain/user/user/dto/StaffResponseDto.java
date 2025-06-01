package com.petner.anidoc.domain.user.user.dto;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StaffResponseDto {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private UserStatus status;

    public static StaffResponseDto fromEntity(User user) {
        return StaffResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .status(user.getStatus())
                .build();
    }
}