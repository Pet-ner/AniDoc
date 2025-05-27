package com.petner.anidoc.domain.user.user.controller;

import com.petner.anidoc.domain.user.user.dto.*;
import com.petner.anidoc.domain.user.user.entity.UserStatus;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.user.user.service.AuthTokenService;
import com.petner.anidoc.domain.user.user.service.UserService;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.global.exception.CustomException;
import com.petner.anidoc.global.exception.ErrorCode;
import com.petner.anidoc.global.rq.Rq;
import com.petner.anidoc.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * ✅ UserController
 *
 * - 사용자 인증 및 계정 관리 기능을 제공하는 REST API 컨트롤러입니다.
 *
 * 주요 기능
 *   - 일반 사용자 및 의료진 회원가입
 *   - 이메일 중복 검사
 *   - 로그인 및 토큰 발급
 *   - 로그아웃
 *   - 회원 탈퇴
 *   - 의료진 목록 조회
 */

@Tag(name = "사용자 인증 및 계정 관리", description = "사용자 관련 API")
@SecurityRequirement(name = "BearerAuth")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@Slf4j

public class UserController {

    private final UserService userService;
    private final AuthTokenService authTokenService;
    private final Rq rq;

    // ✅ 회원가입
    @Operation(summary = "회원 가입", description = "필수 정보 입력해 회원가입을 진행합니다.")
    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody UserSignUpRequestDto userSignDto){
        User user = userService.register(userSignDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponseDto.fromEntity(user));
    }

    // ✅ email 중복 검사
    @Operation(summary = "이메일 중복 검사", description = "중복 Email 확인합니다.")
    @GetMapping("/emailCheck")
    public ResponseEntity<String> emailCheck(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);

        if (exists) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("이미 사용 중인 이메일입니다.");
        } else {
            return ResponseEntity
                    .ok("사용 가능한 이메일입니다.");
        }
    }

    // ✅ 로그인
    @Operation(summary = "로그인", description = "email과 password 입력해 로그인합니다.")
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto loginReqDto){
        try {
            UserResponseDto userDto = userService.login(loginReqDto);
            User user = userService.getUserByEmail(loginReqDto.getEmail());
            String token = rq.makeAuthCookies(user);

            LoginResponseDto loginResponseDto = LoginResponseDto.builder()
                    .accessToken(token)
                    .userId(user.getId())
                    .build();
            return ResponseEntity.ok(loginResponseDto);
        } catch (CustomException ce) {
            // 원래 예외를 그대로 전달
            throw ce;
        } catch (Exception e) {
            log.error("로그인 중 예상치 못한 오류 발생: {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.LOGIN_FAILED);
        }

    // TODO : 에러 코드 세분화(USER가 존재하지 않습니다, 비밀번호가 다릅니다 등)
    }


    // ✅ 로그아웃
    @Operation(summary = "로그아웃", description = "로그인 상태에서 로그아웃을 진행합니다.")
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@CookieValue(value = "accessToken", required = false) String accessToken) {
        // 토큰 유효성 검사
        if (accessToken == null || !authTokenService.isValid(accessToken)){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
        }
        userService.logout(accessToken);


        rq.deleteCookie("accessToken");
        rq.deleteCookie("refreshToken");

        return ResponseEntity.ok("로그아웃 성공");
    }

    // ✅ 회원 탈퇴
    @Operation(summary = "회원 탈퇴", description = "로그인 상태에서 회원 탈퇴를 진행합니다.")
    @DeleteMapping("/withdraw")
    public ResponseEntity<String> withdraw(@AuthenticationPrincipal SecurityUser securityUser){
        Long userId = securityUser.getId();
        userService.deleteUser(userId);

        return ResponseEntity.ok("회원 탈퇴 성공");
    }

    // ✅ 현재 인증된 사용자 정보 조회
    @Operation(summary = "현재 사용자 정보 조회", description = "현재 인증된 사용자의 정보를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(@AuthenticationPrincipal SecurityUser securityUser) {
        User user = userService.getUserById(securityUser.getId());
        return ResponseEntity.ok(UserResponseDto.fromEntity(user));
    }

    // ✅ 의료진 조회
    @Operation(summary = "의료진 목록 조회", description = "근무 중인 의료진 목록을 조회합니다.")
    @GetMapping("/staff")
    public ResponseEntity<List<StaffResponseDto>> getStaffList(
            @RequestParam(value = "onlyAvailable", defaultValue = "false") boolean onlyAvailable) {

        List<StaffResponseDto> staffList = userService.getStaffList(onlyAvailable);
        return ResponseEntity.ok(staffList);
    }

    //📍 STATUS

    @GetMapping("/me/status")
    public ResponseEntity<UserStatus> getMyStatus(@AuthenticationPrincipal SecurityUser securityUser){
        UserStatus status = userService.getStatus(securityUser.getId());
        return ResponseEntity.ok(status);
    }


    @PutMapping("/me/status")
    public ResponseEntity<String> updateMyStatus(@AuthenticationPrincipal SecurityUser securityUser,
                                                @RequestParam UserStatus status){
        userService.updateMyStatus(securityUser.getId(),status);
        return ResponseEntity.ok("상태 변경이 반영되었습니다.");
    }



}
