package com.petner.anidoc.global.security;

import com.petner.anidoc.domain.user.user.entity.SsoProvider;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;
import java.util.Map;

/**
 * ✅ CustomOAuth2UserService
 * - 소셜 로그인 성공 시 실행되는 서비스
 * - 주요 기능:
 *   - 소셜 로그인 정보를 기반으로 사용자 정보를 확인하고 처리
 *   - 소셜 로그인 후 사용자 등록 및 정보 업데이트
 */

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    // ✅ 소셜 로그인 처리
    // - OAuth2 로그인 성공 시 호출되어 사용자 정보를 확인하고 등록 혹은 업데이트
    @Transactional
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        // 기본 OAuth2 사용자 정보 로드
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 소셜 로그인 ID와 제공자 정보를 추출
        String oAut2hId = oAuth2User.getName();
        String providerTypeCode = userRequest
                .getClientRegistration()
                .getRegistrationId()
                .toUpperCase(Locale.getDefault());

        String socialId = providerTypeCode + oAut2hId;
        SsoProvider provider = SsoProvider.valueOf(providerTypeCode);

        // 소셜 로그인 프로필 정보 추출 ]
        Map<String, Object> attributes = oAuth2User.getAttributes();
        Map<String, String> attributesProfile = (Map<String, String>) attributes.get("kakao_account");

        // 이메일 추출
        String email = attributesProfile.get("email");

        // 사용자 정보 등록 또는 업데이트
        User user = userService.modifyOrJoin(email, socialId, provider);

        // 인증된 사용자 정보 반환
        return new SecurityUser(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getAuthorities()
        );
    }
}
