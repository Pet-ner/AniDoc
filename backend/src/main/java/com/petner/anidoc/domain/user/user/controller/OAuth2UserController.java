package com.petner.anidoc.domain.user.user.controller;

import com.petner.anidoc.domain.user.user.dto.SocialSignUpRequestDto;
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
//    @PostMapping("/register")
//    public ResponseEntity<UserResponseDto> registerOrUpdateSocialUser(
//            @RequestBody Map<String, String> body) {
//
//
//        System.out.println(">> register 호출됨");
//        System.out.println("body = " + body);
//
//        String email = body.get("email");
//        System.out.println("email = " + email);  // null인지 확인
//
//        User user = userService.modifyOrJoin(email);
//
//        return ResponseEntity.ok(UserResponseDto.fromEntity(user));
//    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> registerOrUpdateSocialUser(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        User user = userService.join(email);  // 신규가입용

        return ResponseEntity.ok(UserResponseDto.fromEntity(user));
    }


    @PatchMapping("/update")
    public ResponseEntity<UserResponseDto> updateSocialUser(
            @CookieValue(value = "accessToken", required = false) String accessToken,
            @RequestBody SocialSignUpRequestDto updateDto) {

        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        // Controller에서 토큰으로부터 User 조회하여 userId 추출
        User currentUser = userService.getUserByAccessToken(accessToken);
        Long userId = currentUser.getId();

        // Service에 userId와 updateDto 전달
        User updatedUser = userService.updateUser(userId, updateDto);

        return ResponseEntity.ok(UserResponseDto.fromEntity(updatedUser));
    }
}






