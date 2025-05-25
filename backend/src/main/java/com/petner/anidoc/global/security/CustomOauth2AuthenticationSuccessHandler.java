package com.petner.anidoc.global.security;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.service.UserService;
import com.petner.anidoc.global.rq.Rq;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CustomOauth2AuthenticationSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    private final ApplicationContext applicationContext;
    private final Rq rq;

    @Value("${custom.site.frontUrl}")
    private String socialUrl;

    @SneakyThrows
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication){
        UserService userService = applicationContext.getBean(UserService.class);

        //rq.getActor() 시큐리티에서 로그인된 회원 정보 가지고 오기
        User actor = userService.findByEmail(rq.getActor().getEmail()).get();

        // 토큰 발급
        rq.makeAuthCookies(actor);
        String redirectUrl = request.getParameter("state");
        // 유저가 Temp_name라면 회원가입 페이지로 보냄
        if ("Temp_name".equals(actor.getName())) {
            redirectUrl = socialUrl +"/auth-register"; // or /onboarding, /signup?from=social 같은 URI
        }

        response.sendRedirect(redirectUrl);

    }
}
