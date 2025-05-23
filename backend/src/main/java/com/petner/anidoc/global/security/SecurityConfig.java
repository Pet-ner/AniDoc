package com.petner.anidoc.global.security;

import com.petner.anidoc.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOauth2AuthenticationSuccessHandler customAuthenticationSuccessHandler;

    private final CustomAuthorizationRequestResolver customAuthorizationRequestResolver;
    private final Rq rq;

    // ✅ JWT 인증 필터 빈 등록
    @Bean
    public CustomAuthenticationFilter customAuthenticationFilter(){
        return new CustomAuthenticationFilter(rq);
    }

    // ✅ Spring Security 필터 체인 설정
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)

                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .sessionManagement(sessionManagement ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .oauth2Login(
                        oauth2Login -> oauth2Login
                                .successHandler(customAuthenticationSuccessHandler)

                                .authorizationEndpoint(
                        authorizationEndpoint ->
                            authorizationEndpoint.authorizationRequestResolver(customAuthorizationRequestResolver)
                    )
                )
                // ✅ 경로별 인가 정책 설정
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                .requestMatchers("/h2-console/**").permitAll()
                                .requestMatchers("/api/users/register", "/api/users/login", "/api/users/logout").permitAll()
                                .requestMatchers("/api/users/emailCheck").permitAll()
                                .requestMatchers("/auth/**").permitAll()
                                .requestMatchers("/swagger-ui/**").permitAll()
                                .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()

                                // 임시
                                .requestMatchers(HttpMethod.GET, "/api/vets/**").permitAll()

                                .requestMatchers("/api/**").authenticated()




                                // TODO: 추후 인증 필요 경로 설정 예정
                                .anyRequest().permitAll()
                )

                .headers(headers -> headers
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
                );

        // ✅ JWT 필터 등록
        http.addFilterBefore(customAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:8090"
        ));
        configuration.setAllowCredentials(true);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));  // 응답에서 Authorization 헤더 노출
        configuration.setMaxAge(3600L);  // 브라우저가 preflight 요청 결과를 캐시하는 시간(초)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    // ✅ 비밀번호 암호화를 위한 PasswordEncoder Bean 등록
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
