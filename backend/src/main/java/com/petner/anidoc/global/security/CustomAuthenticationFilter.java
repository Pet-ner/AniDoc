package com.petner.anidoc.global.security;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.global.rq.Rq;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationFilter extends OncePerRequestFilter {

    private final Rq rq;

    // ✅ 요청에서 토큰 정보를 추출
    record AuthTokens(String refreshToken, String accessToken) {}

    // ✅ 요청에서 accessToken or refreshToken 추출
    private AuthTokens getAuthTokensFromRequest(){
        // 1. Authorization 헤더에서 accessToken 추출
        String authorization = rq.getHeader("Authorization");
        System.out.println("헤더: " + rq.getHeader("Authorization"));

        if (authorization != null && authorization.startsWith("Bearer ")) {
            String accessToken = authorization.substring("Bearer ".length());
            return new AuthTokens(null, accessToken);
        }

        // 쿠키에서 accessToken과 refreshToken 추출
        String refreshToken = rq.getCookieValue("refreshToken");
        String accessToken = rq.getCookieValue("accessToken");

        if (accessToken != null) {
            return new AuthTokens(refreshToken, accessToken);
        }

        return null;
    }


    // ✅ refreshToken을 이용해서 accessToken을 재발급
    private User refreshAccessTokenByRefreshToken(String refreshToken){
        return rq.refreshAccessTokenByRefreshToken(refreshToken);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // ✅ /api/ 로 시작하지 않는 요청은 필터 거치지 않게 함
        if (!request.getRequestURI().startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // ✅ 인증이 필요 없는 엔드포인트 필터 통과 처리
        if (List.of(
                "/api/users/signup",
                "/api/users/login",
//                "/api/users/logout",
                "/api/users/register"
        ).contains(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        // ✅ 요청에서 토큰 추출
        AuthTokens authTokens = getAuthTokensFromRequest();

        // 토큰이 없으면 통과 (*비인증)
        if (authTokens == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String refreshToken = authTokens.refreshToken;
        String accessToken = authTokens.accessToken;

        // ✅ accessToken으로 사용자 조회
        User user = rq.getUserByAccessToken(accessToken);

        // ✅ accessToken으로 유저를 못 찾으면 refreshToken으로 시도
        if (user == null)
            user = refreshAccessTokenByRefreshToken(refreshToken);

        // ✅ 인증된 유저라면 세션에 로그인 처리
        if (user != null)
            rq.setLogin(user);

        // ✅ 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }

}
