package com.petner.anidoc.global.rq;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.service.AuthTokenService;
import com.petner.anidoc.domain.user.user.service.UserService;
import com.petner.anidoc.global.exception.CustomException;
import com.petner.anidoc.global.exception.ErrorCode;
import com.petner.anidoc.global.security.SecurityUser;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.util.Arrays;
import java.util.Optional;

/**
 * ✅ Rq: Request 및 Response 객체를 래핑해
 *  - 주요 기능
 *   - 인증/세션 처리
 *   - 쿠키 처리
 *   - 헤더 처리
 *   - 토큰 갱신
 *   등을 쉽게 다룰 수 있도록 돕는 유틸리티 클래스
 */
@RequestScope
@Component
@RequiredArgsConstructor
public class Rq {

    private final HttpServletRequest req;
    private final HttpServletResponse resp;
    private final UserService userService;
    private final AuthTokenService authTokenService;

    @Value("${custom.cookieDomain}")
    private String cookieDomain;

    // ✅ SecurityContextHolder에 인증 정보 등록
    public void setLogin(User user){

        UserDetails userDetails = new SecurityUser(
                user.getId(),
                user.getEmail(),
                "",
                user.getAuthorities()
        );

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    // ✅ 현재 로그인한 유저 반환
    public User getActor(){
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof SecurityUser)
                .map(principal -> (SecurityUser) principal)
                .map(securityUser -> User.builder()
                        .id(securityUser.getId())
                        .email(securityUser.getUsername())
                        .build())
                .orElse(null);
    }


    // ✅ 쿠키 생성 및 응답에 추가
    public void setCookie(String name, String value){
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .path("/")
                .sameSite("Strict")
                .secure(true)
                .httpOnly(true)
                .build();

        resp.addHeader("Set-Cookie", cookie.toString());
    }

    //✅ 쿠키에서 값 조회
    public String getCookieValue(String name){
        return Optional.ofNullable(req.getCookies())
                .stream()
                .flatMap(Arrays::stream)
                .filter(cookie -> cookie.getName().equals(name))
                .map(cookie -> cookie.getValue())
                .findFirst()
                .orElse(null);
    }

    public String getCookieValue(Cookie[] cookies, String name) {
        return Arrays.stream(cookies)
                .filter(cookie -> cookie.getName().equals(name))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

     // ✅ 쿠키 삭제
    public void deleteCookie(String name){
        ResponseCookie cookie = ResponseCookie.from(name, null)
                .path("/")
                .domain(cookieDomain)
                .sameSite("Strict")
                .secure(true)
                .httpOnly(true)
                .maxAge(0)
                .build();

        resp.addHeader("Set-Cookie", cookie.toString());
    }

    //✅ 응답 헤더 설정
    public void setHeader(String name, String value){
        resp.setHeader(name, value);
    }

    //✅ 요청 헤더 조회
    public String getHeader(String name) {
        // req 객체가 null인지 확인
        if (req == null) {
            System.out.println("Request 객체가 null입니다.");
            return null;
        }
        // 헤더 값 가져오기
        String headerValue = req.getHeader(name);

        // 헤더 값 출력
        System.out.println("RQ의 Header! " + name + ": " + (headerValue != null ? headerValue : "헤더 없음"));

        // 모든 헤더를 출력하여 어떤 헤더들이 존재하는지 확인
        System.out.println("사용 가능한 모든 헤더:");
        java.util.Enumeration<String> headerNames = req.getHeaderNames();
        if (headerNames != null) {
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                System.out.println(headerName + ": " + req.getHeader(headerName));
            }
        }
        return headerValue;
    }

    // ✅ AccessToken 갱신
    public void refreshAccessToken(User user){
        String newAccessToken = userService.genAccessToken(user);

        setHeader("Authorization", "Bearer " + newAccessToken);
        setCookie("accessToken", newAccessToken);
    }

    // ✅ refreshToken을 이용해 사용자 인증 및 accessToken 갱신
    public User refreshAccessTokenByRefreshToken(String refreshToken){
        return userService.findByRefreshToken(refreshToken)
                .map(user -> {
                    refreshAccessToken(user);
                    return user;
                })
                .orElse(null);
    }

    //✅ 인증 후 쿠키 발급
    public String makeAuthCookies(User user){
        String accessToken = userService.genAccessToken(user);
        String refreshToken = authTokenService.generateRefreshToken(user);

        setCookie("refreshToken", refreshToken);
        setCookie("accessToken", accessToken);

        return accessToken;
    }

    // ✅ accessToken으로 사용자 조회
    public User getUserByAccessToken(String accessToken){
        return userService.getUserByAccessToken(accessToken);
    }

    // ✅ accessToken으로 사용자 조회 - 헤더에서 자동으로 읽어옴
    public User getUserByAccessToken() {
        String authHeader = req.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        return userService.getUserByAccessToken(token);
    }
}
