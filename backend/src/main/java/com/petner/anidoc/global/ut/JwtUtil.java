package com.petner.anidoc.global.ut;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * ✅ JWT 관련 유틸리티 클래스
 * - 주요 기능
 *  - 토큰 생성
 *  - 유효성 검증
 *  - 페이로드 추출
 */
public class JwtUtil {

    // ✅ JWT 생성 메서드
    public static String generateToken(String secret, long expireSeconds, Map<String, Object> body) {
        // 발급 시간
        Date issuedAt = new Date();
        // 만료 시간
        Date expiryDate = new Date(issuedAt.getTime() + 1000L * expireSeconds);

        // 비밀 키 생성
        SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes());

        return Jwts.builder()
                .claims(body)
                .issuedAt(issuedAt)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    // ✅ JWT 유효성 검증 메서드
    public static boolean isValid(String secret, String token) {
        SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parse(token);
            return true;
        } catch (Exception e) {
            //예외 발생 시 유효하지 않게 처리
            return false;
        }
    }

    // ✅ JWT에서 payload 정보 추출
    public static Map<String, Object> payload(String secret, String token) {
        SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes());

        try {
            Object payload = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parse(token)
                    .getPayload();

            Map<String, Object> payloadMap = null;

            if (payload instanceof Claims) {
                payloadMap = new HashMap<>((Claims) payload);
            } else if (payload instanceof Map) {
                payloadMap = new HashMap<>((Map<String, Object>) payload);
            } else {
                System.out.println("예상치 못한 payload 타입: " + payload.getClass());
                return null;
            }
            return payloadMap;

        } catch (Exception e) {
            System.out.println("JWT 파싱 실패: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
