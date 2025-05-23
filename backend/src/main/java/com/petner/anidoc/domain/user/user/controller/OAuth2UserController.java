package com.petner.anidoc.domain.user.user.controller;

import com.petner.anidoc.domain.user.user.dto.UserResponseDto;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/social")
public class OAuth2UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getSocialUser(
            @CookieValue(value = "accessToken", required = false) String accessToken) {

        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null); // 또는 적절한 에러 응답
        }

        User user = userService.getUserByAccessToken(accessToken);
        return ResponseEntity.ok(UserResponseDto.fromEntity(user));
    }
    // ✅ 소셜 유저 최초 접근 시 가입 or 기존 유저 수정
    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> registerOrUpdateSocialUser(
            @RequestBody Map<String, String> body) {


        System.out.println(">> register 호출됨");
        System.out.println("body = " + body);

        String email = body.get("email");
        System.out.println("email = " + email);  // null인지 확인

        User user = userService.modifyOrJoin(email);

        return ResponseEntity.ok(UserResponseDto.fromEntity(user));
    }
}


