package com.petner.anidoc.global.security;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;


// 소셜 로그인 성공 시 실행되는 함수
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    @Transactional
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest){
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String socialId = oAuth2User.getName();
        String providerTypeCode = userRequest
                .getClientRegistration()
                .getRegistrationId()
                .toUpperCase(Locale.getDefault());

        Map<String, Object> attributes = oAuth2User.getAttributes();
//        Map<String, String> attributesProperties = (Map<String,String>)attributes.get("properties");
        Map<String, String> attributesProfile = (Map<String,String>)attributes.get("kakao_account");


        String email = attributesProfile.get("email");
//        String name = providerTypeCode + "__" + socialId;

        User user = userService.modifyOrJoin(email);

        return new SecurityUser(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getAuthorities()
        );
    }
}
