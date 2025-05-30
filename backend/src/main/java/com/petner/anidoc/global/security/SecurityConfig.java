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
    @Lazy
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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .csrf(AbstractHttpConfigurer::disable)

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
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .anyRequest().permitAll() // 임시로 모든 요청 허용
//                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//                                .requestMatchers("/api/vets", "/api/vets/**").permitAll()
//                                .requestMatchers("/h2-console/**").permitAll()
//                                .requestMatchers("/api/users/register", "/api/users/login", "/api/users/logout").permitAll()
//                                .requestMatchers("/api/users/emailCheck").permitAll()
//                                .requestMatchers("/auth/**").permitAll()
//                                .requestMatchers("/swagger-ui/**").permitAll()
//                                .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
//                                //펫등록 삭제 추가(보호자, 의료진,스태프)
//                                .requestMatchers(HttpMethod.DELETE, "/api/pets/**").hasRole("USER")
//                                .requestMatchers(HttpMethod.DELETE, "/api/doctor/pets/**").hasAnyRole("STAFF", "ADMIN")
//
//                                //예방접종 삭제 추가(의료진)
//                                .requestMatchers("/api/vaccins/**").hasRole("STAFF")
//
//                                //s3 이미지 조회
//                                .requestMatchers("/api/s3/presigned-url/view").permitAll()
//
//                                // 임시
//                                .requestMatchers(HttpMethod.GET, "/api/vets/**").permitAll()
//
//                                .requestMatchers("/api/**").authenticated()
//
//
//
//
//                                // TODO: 추후 인증 필요 경로 설정 예정
//                                .anyRequest().permitAll()
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


        // 또는 구체적인 도메인 설정
         configuration.setAllowedOrigins(List.of(
             "http://localhost:3000",
             "http://localhost:8090",
             "https://www.anidoc.site",
             "https://anidoc.site"
         ));

        configuration.setAllowCredentials(true);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Set-Cookie"));
        configuration.setMaxAge(3600L);

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
