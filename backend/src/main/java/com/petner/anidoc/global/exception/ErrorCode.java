package com.petner.anidoc.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * ✅ 에러 코드(Enum)
 * - 각 에러에 대한 HTTP 상태 코드와 메시지를 관리하는 Enum 클래스
 */
@Getter
@AllArgsConstructor
public enum ErrorCode {

    // 인증 관련 오류
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증되지 않은 요청입니다."),

    // 사용자 관련 오류
    USER_NOT_FOUND(HttpStatus.NOT_FOUND,"사용자가 존재하지 않습니다."),
    PASSWORD_MISMATCH(HttpStatus.BAD_REQUEST, "비밀번호가 일치하지 않습니다."),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT,"이미 존재하는 이메일입니다."),

    // 로그인 중 오류
    LOGIN_FAILED(HttpStatus.CONFLICT,"로그인에 실패했습니다."),

    // 로그아웃 중 오류
    LOGOUT_FAILED(HttpStatus.INTERNAL_SERVER_ERROR,  "로그아웃에 실패했습니다.");
    // HTTP 상태 코드와 메시지
    private final HttpStatus httpStatus;
    private final String message;
}
