package com.petner.anidoc.global.config;

import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * ✅ Swagger 설정 클래스
 *  - 주요 기능
 *      - Swagger UI에서 JWT 인증을 사용 가능
 */

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        Server server = new Server();
        server.setUrl("https://api.anidoc.site");
        return new OpenAPI()
                .info(new Info().title("API 문서").version("v1"))
                .servers(List.of(server))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")))
                .addSecurityItem(
                        new SecurityRequirement().addList("BearerAuth"));
    }
}
