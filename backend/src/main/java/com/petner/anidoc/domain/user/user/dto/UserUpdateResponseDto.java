package com.petner.anidoc.domain.user.user.dto;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateResponseDto {
        private Long id;
        private String email;
        private String password;
        private UserRole userRole;
        private String phoneNumber;
        private String emergencyContact;
        private Long vetInfoId; // 소속 병원 ID
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private boolean isSocialLogin; // 소셜 로그인 여부




        public static UserUpdateResponseDto fromEntity(User user){
            return UserUpdateResponseDto.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .password(user.getPassword())
                    .userRole(user.getRole())
                    .phoneNumber(user.getPhoneNumber())
                    .emergencyContact(user.getEmergencyContact())
                    .vetInfoId(user.getVetInfo().getId())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .isSocialLogin(user.getSocialId() != null)
                    .build();
        }

    }

