package com.petner.anidoc.domain.user.user.controller;


import com.petner.anidoc.domain.user.user.dto.UserResponseDto;
import com.petner.anidoc.domain.user.user.service.UserService;
import com.petner.anidoc.domain.user.user.service.UserStatusService;
import com.petner.anidoc.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Security;
import java.util.List;

@RestController
@RequestMapping("/api/admins")
@RequiredArgsConstructor

/**
 * ✅ admin이 staff의 가입 승인/거부/조회
 * */

public class AdminController {

    private final UserService userService;
    private final UserStatusService userStatusService;

    // ✅ 승인 대기 목록 조회
    @Operation(summary = "승인 대기 목록 조회", description = "의료진 가입 승인 대기 중인 사용자 목록을 조회합니다.")
    @GetMapping("/pending-approvals")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getPendingApprovals(){
        List<UserResponseDto> pendingUsers = userStatusService.getPendingApprovalUsers();
        return ResponseEntity.ok(pendingUsers);
    }

    // ✅ 승인 완료 처리
    @PostMapping("/approve/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<String> approveUser(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser admin){

        userStatusService.approveUser(id, admin.getId());
        return ResponseEntity.ok("사용자 승인 완료");
    }

    // ✅ 승인 거절
    @DeleteMapping("/reject/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<String> rejectUser(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser admin) {
        userStatusService.rejectUser(id, admin.getId());
        return ResponseEntity.ok("사용자 승인 거부");
    }


}


