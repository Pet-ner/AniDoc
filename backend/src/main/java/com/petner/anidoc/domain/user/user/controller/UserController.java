package com.petner.anidoc.domain.user.user.controller;

import com.petner.anidoc.domain.user.user.dto.*;
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
 * - 사용자 회원가입과 로그인 기능을 제공하는 REST API 컨트롤러
 * - 주요 기능
 * - 회원가입 및 유저 등록
 * - 로그인
 * - 토큰 반환
 */

@SecurityRequirement(name = "BearerAuth")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@Slf4j
public class UserController {

    private final UserService userService;
    private final AuthTokenService authTokenService;
    private final UserRepository userRepository;
    private final Rq rq;

    // ✅ 회원가입
    @Operation(summary = "회원 가입", description = "User Register 관련 API")
    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody UserSignUpRequestDto userSignDto){
        User user = userService.register(userSignDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponseDto.fromEntity(user));
    }

    // ✅ email 중복 검사
    @Operation(summary = "이메일 중복 검사", description = "Email check 관련 API")
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
    @Operation(summary = "로그인", description = "Login 관련 API")
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
    @Operation(summary = "로그아웃", description = "Logout 관련 API")
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader(value = "Authorization", required = false) String header) {

        if (header == null || !header.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("올바른 인증 토큰이 필요합니다.");
        }

        String accessToken = header.substring(7);

        // 토큰 유효성 검사
        if (!authTokenService.isValid(accessToken)){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
        }
        userService.logout(accessToken);


        rq.deleteCookie("accessToken");
        rq.deleteCookie("refreshToken");

        return ResponseEntity.ok("로그아웃 성공");
    }

    // ✅ 회원 탈퇴
    @Operation(summary = "회원 탈퇴", description = "Withdraw 관련 API")
    @DeleteMapping("/withdraw")
    public ResponseEntity<String> withdraw(@AuthenticationPrincipal SecurityUser securityUser){
        Long userId = securityUser.getId();
        userService.deleteUser(userId);

        return ResponseEntity.ok("회원 탈퇴 성공");
    }

    // ✅ 의료진 조회
    @Operation(summary = "의료진 목록 조회", description = "근무 중인 의료진 목록을 조회합니다.")
    @GetMapping("/staff")
    public ResponseEntity<List<StaffResponseDto>> getStaffList(
            @RequestParam(value = "onlyAvailable", defaultValue = "false") boolean onlyAvailable) {

        List<StaffResponseDto> staffList = userService.getStaffList(onlyAvailable);
        return ResponseEntity.ok(staffList);
    }
}
