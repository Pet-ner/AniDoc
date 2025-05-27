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

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    @Transactional
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String providerTypeCode = userRequest
                .getClientRegistration()
                .getRegistrationId()
                .toUpperCase(Locale.getDefault());

        SsoProvider provider = SsoProvider.valueOf(providerTypeCode);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        User user = null; // 지역변수로 선언

        if (provider == SsoProvider.KAKAO) {
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            String email = (String) kakaoAccount.get("email");
            String oAuthId = oAuth2User.getName();
            String socialId = providerTypeCode + oAuthId;

            user = userService.modifyOrJoin(email, socialId, provider);

        } else if (provider == SsoProvider.NAVER) {
            Map<String, Object> response = (Map<String, Object>) attributes.get("response");
            String email = (String) response.get("email");
            String oAuthId = (String) response.get("id");
            String socialId = providerTypeCode + oAuthId;

            user = userService.modifyOrJoin(email, socialId, provider);
        }

        // null 체크 추가
        if (user == null) {
            throw new RuntimeException("지원하지 않는 소셜 로그인 제공업체입니다: " + provider);
        }

        return new SecurityUser(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getAuthorities()
        );
    }
}