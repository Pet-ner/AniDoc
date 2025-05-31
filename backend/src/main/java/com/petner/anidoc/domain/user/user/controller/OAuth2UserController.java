package com.petner.anidoc.domain.user.user.controller;

import com.petner.anidoc.domain.user.user.dto.SocialSignUpRequestDto;
import com.petner.anidoc.domain.user.user.dto.UserResponseDto;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ✅ OAuth2UserController
 * - 소셜 로그인 및 추가 정보 입력 관련 API를 제공하는 컨트롤러 클래스
 * - 주요 기능:
 *   - 로그인된 사용자 정보 조회
 *   - 사용자 정보 수정
 */
@Tag(name = "소셜 로그인 및 추가 정보 입력", description = "소셜 로그인 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/social")
public class OAuth2UserController {

    private final UserService userService;

    /**
     * ✅ accessToken을 이용해 현재 로그인된 사용자 정보 조회
     * - 클라이언트가 전달한 accessToken을 이용해 로그인된 사용자의 정보를 조회하고 반환
     *
     * @param accessToken - 쿠키에서 전달받은 accessToken
     * @return 로그인된 사용자의 정보 (UserResponseDto)
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getSocialUser(
            @CookieValue(value = "accessToken", required = false) String accessToken) {

        // 토큰이 없는 경우 401 Unauthorized 응답
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null); // 또는 적절한 에러 메시지 DTO 사용 가능
        }

        // 토큰을 통해 사용자 정보 조회
        User user = userService.getUserByAccessToken(accessToken);

        // 사용자 정보를 응답으로 반환
        return ResponseEntity.ok(UserResponseDto.fromEntity(user));
    }

    /**
     * ✅ accessToken을 이용해 현재 로그인된 사용자의 추가 정보를 수정
     * - 클라이언트가 전달한 수정 정보를 통해 로그인된 사용자의 추가 정보를 수정
     *
     * @param accessToken - 쿠키에서 전달받은 accessToken
     * @param updateDto - 클라이언트로부터 전달받은 수정 정보
     * @return 수정된 사용자 정보 (UserResponseDto)
     */
    @PatchMapping("/update")
    public ResponseEntity<UserResponseDto> updateSocialUser(
            @CookieValue(value = "accessToken", required = false) String accessToken,
            @RequestBody SocialSignUpRequestDto updateDto) {

        // 토큰이 없는 경우 401 Unauthorized 응답
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        // accessToken을 통해 현재 로그인된 사용자 조회
        User currentUser = userService.getUserByAccessToken(accessToken);
        Long userId = currentUser.getId();

        // 사용자 ID와 업데이트 정보를 서비스로 전달하여 사용자 정보 수정
        User updatedUser = userService.updateSocialUser(userId, updateDto);

        // 수정된 사용자 정보를 응답으로 반환
        return ResponseEntity.ok(UserResponseDto.fromEntity(updatedUser));
    }
}
