package com.petner.anidoc.domain.user.user.service;

import com.petner.anidoc.domain.user.user.dto.UserResponseDto;
import com.petner.anidoc.domain.user.user.entity.ApprovalStatus;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.entity.UserStatus;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.global.exception.CustomException;
import com.petner.anidoc.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor

public class UserStatusService {

    private final UserRepository userRepository;

    // 📍 가입 승인

    // ✅ 의료진 가입 승인
    @Transactional
    public void approveUser(Long userId, Long adminId){
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (user.getRole() != UserRole.ROLE_STAFF){
            throw new CustomException(ErrorCode.INVALID_USER_ROLE);

        }

        user.setApprovalStatus(ApprovalStatus.APPROVED);
        userRepository.save(user);
    }

    // ✅`승인 거부
    @Transactional
    public void rejectUser(Long userId, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        userRepository.delete(user);
        userRepository.flush();
    }

    // ✅`승인 대기 중인 사용자 목록 조회
    @Transactional(readOnly = true)
    public List<UserResponseDto> getPendingApprovalUsers() {
        List<User> pendingUsers = userRepository
                .findByRoleAndApprovalStatus(UserRole.ROLE_STAFF, ApprovalStatus.PENDING);

        return pendingUsers.stream()
                .map(UserResponseDto::fromEntity)
                .collect(Collectors.toList());
    }


    // ✅ 로그인 시 상태 설정 및 승인 검증
    @Transactional
    public void checkLoginUser(User user){
        // 상태 설정
        user.setStatus(UserStatus.ON_DUTY);

        // 승인 상태 확인
        if (user.getRole() == UserRole.ROLE_STAFF &&
                user.getApprovalStatus() != ApprovalStatus.APPROVED) {

            if (user.getApprovalStatus() == ApprovalStatus.PENDING) {
                throw new CustomException(ErrorCode.APPROVAL_PENDING);
            } else if (user.getApprovalStatus() == ApprovalStatus.REJECTED) {
                throw new CustomException(ErrorCode.APPROVAL_REJECTED);
            }
        }
    }



}
