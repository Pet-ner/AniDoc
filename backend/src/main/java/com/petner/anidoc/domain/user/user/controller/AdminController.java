package com.petner.anidoc.domain.user.user.controller;


import com.petner.anidoc.domain.user.user.dto.UserResponseDto;
import com.petner.anidoc.domain.user.user.service.UserService;
import com.petner.anidoc.global.security.SecurityUser;
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

public class AdminController {

    private final UserService userService;

    // ✅ 승인 대기 목록 조회

    @GetMapping("/pending-approvals")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getPendingApprovals(){
        List<UserResponseDto> pendingUsers = userService.getPendingApprovalUsers();
        return ResponseEntity.ok(pendingUsers);
    }

    // ✅ 승인 완료 처리
    @PostMapping("/approve/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> approveUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal SecurityUser admin){

        userService.approveUser(userId, admin.getId());
        return ResponseEntity.ok("사용자 승인 완료");
    }


    // ✅ 승인 거절
    @PostMapping("reject/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> rejectUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal SecurityUser admin){
        userService.rejectUser(userId,admin.getId());
        return ResponseEntity.ok("사용자 승인 거부");
    }


}


