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
    LOGOUT_FAILED(HttpStatus.INTERNAL_SERVER_ERROR,  "로그아웃에 실패했습니다."),

    // 병원 정보 관련 오류
    VET_NOT_FOUND(HttpStatus.NOT_FOUND,"병원이 존재하지 않습니다."),

    // 채팅 관련 오류
    ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "채팅방이 존재하지 않습니다."),

    // 진료 기록 관련 오류
    MEDICAL_RECORD_NOT_FOUND(HttpStatus.NOT_FOUND, "진료 기록이 존재하지 않습니다."),
    NO_MEDICAL_RECORD_MANAGE_PERMISSION(HttpStatus.FORBIDDEN, "진료 기록 관리 권한이 없습니다."),

    // 처방전 관련 오류
    PRESCRIPTION_NOT_FOUND(HttpStatus.NOT_FOUND, "처방전이 존재하지 않습니다."),
    NO_PRESCRIPTION_MANAGE_PERMISSION(HttpStatus.FORBIDDEN, "처방전 관리 권한이 없습니다."),

    // 약품 관련 오류
    MEDICINE_NOT_FOUND(HttpStatus.NOT_FOUND, "약품이 존재하지 않습니다."),
    NO_MEDICINE_MANAGE_PERMISSION(HttpStatus.FORBIDDEN, "약품 관리 권한이 없습니다."),
    MEDICINE_ALREADY_REGISTERED(HttpStatus.CONFLICT, "이미 등록된 약품입니다."),
    INVALID_STOCK_VALUE(HttpStatus.BAD_REQUEST, "재고는 0 이상이어야 합니다."),
    INSUFFICIENT_STOCK(HttpStatus.BAD_REQUEST, "재고가 부족합니다."),
    INVALID_DECREASE_AMOUNT(HttpStatus.BAD_REQUEST, "차감할 수량은 0보다 커야 합니다."),
    INVALID_INCREASE_AMOUNT(HttpStatus.BAD_REQUEST, "증가할 수량은 0보다 커야 합니다.");

    // HTTP 상태 코드와 메시지
    private final HttpStatus httpStatus;
    private final String message;
}
