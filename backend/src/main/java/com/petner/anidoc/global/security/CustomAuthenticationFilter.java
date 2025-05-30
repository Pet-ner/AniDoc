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
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationFilter extends OncePerRequestFilter {

    private final Rq rq;

    // ✅ 요청에서 토큰 정보를 추출
    record AuthTokens(String refreshToken, String accessToken) {}

    // ✅ 요청에서 accessToken or refreshToken 추출
    private AuthTokens getAuthTokensFromRequest(){
        // Authorization 헤더에서 accessToken 추출
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

        String uri = request.getRequestURI();

        // 필터를 적용하지 않을 조건
        if (!uri.startsWith("/api/") ||
                List.of("/api/users/signup", "/api/users/login", "/api/users/register").contains(uri)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 토큰 처리 및 사용자 인증
        Optional.ofNullable(getAuthTokensFromRequest())
                .ifPresent(authTokens ->
                        Optional.ofNullable(rq.getUserByAccessToken(authTokens.accessToken))
                                .or(() -> Optional.ofNullable(refreshAccessTokenByRefreshToken(authTokens.refreshToken)))
                                .ifPresent(rq::setLogin)
                );
        // 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }
}
