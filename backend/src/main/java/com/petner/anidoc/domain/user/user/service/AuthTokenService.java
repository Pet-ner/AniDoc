package com.petner.anidoc.domain.user.user.service;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.global.ut.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

/**
 * ✅ AuthTokenService
 * - 사용자 인증을 위한 JWT(Json Web Token)를 생성, 검증, 추출하는 서비스 클래스
 * - 주요 기능:
 *   - 엑세스 토큰 생성
 *   - 리프레시 토큰 생성
 *   - 토큰 유효성 검사
 *   - 토큰의 payload 추출
 */

@Service
@RequiredArgsConstructor


public class AuthTokenService {

    @Value("${custom.jwt.secretKey}")
    private String jwtSecretKey;

    @Value("${custom.accessToken.expirationSeconds}")
    private long accessTokenExpirationSeconds;

    @Value("${custom.refreshToken.expirationSeconds}")
    private long refreshTokenExpirationSeconds;

    // ✅ 엑세스 토큰 생성
    public String genAccessToken(User user){
        long id = user.getId();
        String email = user.getEmail();
        String role = user.getRole().name();


        return JwtUtil.generateToken(
                jwtSecretKey,
                accessTokenExpirationSeconds,
                Map.of("id", id, "email", email,"role", role)
        );
    }

    // ✅ 리프레시 토큰 생성
    @Transactional
    public String generateRefreshToken(User user) {
        long id = user.getId();
        String email = user.getEmail();

        return JwtUtil.generateToken(
                jwtSecretKey,
                refreshTokenExpirationSeconds,
                Map.of("id", id, "email", email)
        );
    }

    // ✅ 토큰 검사
    public boolean isValid(String token){
        return JwtUtil.isValid(jwtSecretKey, token);
    }

    // ✅ payload 추출
    public Map<String, Object> payload(String token){
        return JwtUtil.payload(jwtSecretKey, token);
    }
}
