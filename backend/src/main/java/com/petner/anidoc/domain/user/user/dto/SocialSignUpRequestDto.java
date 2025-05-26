package com.petner.anidoc.domain.user.user.dto;

import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import lombok.Builder;
import lombok.Getter;

/**
 * ✅ SocialSignUpRequestDto
 * - 소셜 회원가입 시 사용자가 입력해야 하는 정보를 담고 있는 DTO(Data Transfer Object)
 * - 주요 필드:
 *   - name: 사용자의 이름
 *   - phoneNumber: 사용자의 전화번호
 *   - emergencyContact: 사용자의 비상 연락처
 *   - role: 사용자의 역할
 *   - vetInfo: 사용자가 소속된 병원 정보
 */

@Getter
@Builder

public class SocialSignUpRequestDto {
        private String name;
        private String phoneNumber;
        private String emergencyContact;
        private UserRole role;
        private VetInfo vetInfo;
    }
