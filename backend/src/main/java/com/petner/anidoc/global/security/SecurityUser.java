package com.petner.anidoc.global.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

/**
 * ✅ SecurityUser
 * - Spring Security의 User를 확장
 * - id와 socialId를 추가로 저장
 * - OAuth2User도 구현
 */
public class SecurityUser extends User implements OAuth2User {

    // 사용자 고유 ID
    @Getter
    private long id;

    // 소셜 로그인 ID
    @Getter
    private String socialId;

    /**
     * SecurityUser 생성자
     * @param id 사용자 ID
     * @param email 사용자 이메일 (username 역할)
     * @param password 비밀번호
     * @param authorities 권한 목록
     */
    public SecurityUser(
            long id,
            String email,
            String password,
            Collection<? extends GrantedAuthority> authorities
    ){

        super(email, password, authorities);
        this.id = id;
    }

    /**
     * OAuth2User 인터페이스 구현 - 소셜 사용자 속성
     */
    @Override
    public Map<String, Object> getAttributes(){
        return Map.of();
    }

    /**
     * OAuth2User 인터페이스 구현 - 사용자 이름 반환
     */
    @Override
    public String getName(){
        return getUsername();
    }
}
