package com.petner.anidoc.global.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 메시지를 받을 때, 경로를 설정해주는 함수
        registry.enableSimpleBroker("/sub");

        // 메시지를 보낼 때, 관련 경로를 설정해주는 함수
        registry.setApplicationDestinationPrefixes("/pub");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 웹소켓 연결 엔드포인트 설정
        registry.addEndpoint("/ws-stomp")
                .setAllowedOriginPatterns("https://www.anidoc.site", "http://localhost:3000")
                .addInterceptors(webSocketAuthInterceptor) // 인터셉터 적용
                .withSockJS(); // SockJs 지원
    }
}
