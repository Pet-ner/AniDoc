package com.petner.anidoc.global.websocket;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.service.UserService;
import com.petner.anidoc.global.rq.Rq;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements HandshakeInterceptor {
    private final Rq rq;
    private final UserService userService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        try {
            // ServletServerHttpRequest로 캐스팅해서 쿠키 접근
            if (!(request instanceof ServletServerHttpRequest servletRequest)) {
                log.warn("WebSocket 인증 실패: 잘못된 요청 타입");
                return false;
            }

            Cookie[] cookies = servletRequest.getServletRequest().getCookies();

            if (cookies == null) {
                log.warn("WebSocket 인증 실패: 쿠키 없음");
                return false;
            }

            // 쿠키에서 accessToken과 refreshToken 추출
            String accessToken = rq.getCookieValue(cookies, "accessToken");
            String refreshToken = rq.getCookieValue(cookies, "refreshToken");

            User user = null;

            // accessToken으로 유저 인증 시도
            if (accessToken != null) {
                user = userService.getUserByAccessToken(accessToken);
            }

            // accessToken이 실패하면 refreshToken으로 시도
            if (user == null && refreshToken != null) {
                user = userService.findByRefreshToken(refreshToken).orElse(null);
            }

            if (user == null) {
                log.warn("WebSocket 인증 실패: 유효한 토큰 없음");
                return false;
            }

            // 인증된 유저 정보를 WebSocket 세션 속성에 저장
            attributes.put("userId", user.getId());
            attributes.put("userEmail", user.getEmail());
            attributes.put("userRole", user.getRole().name());

            log.info("WebSocket 연결 성공 - 유저: {}", user.getId());
            return true;

        } catch (Exception e) {
            log.error("WebSocket 인증 실패: ", e);
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            log.error("WebSocket 핸드셰이크 실패: ", exception);
        }
    }

}
