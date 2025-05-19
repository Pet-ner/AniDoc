package com.petner.anidoc.domain.user.user.service;

import com.petner.anidoc.domain.user.user.dto.LoginRequestDto;
import com.petner.anidoc.domain.user.user.dto.StaffResponseDto;
import com.petner.anidoc.domain.user.user.dto.UserResponseDto;
import com.petner.anidoc.domain.user.user.dto.UserSignUpRequestDto;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.entity.UserStatus;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import com.petner.anidoc.domain.vet.vet.repository.VetInfoRepository;
import com.petner.anidoc.global.exception.CustomException;
import com.petner.anidoc.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


/**
 * ✅ UserService
 * - 사용자 등록, 로그인, 로그아웃, 엑세스 토큰 생성 등의 기능을 제공
 * - 이메일 중복 검사, 사용자 조회, 비밀번호 확인, 토큰 생성 및 갱신 등
 */


@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final VetInfoRepository vetInfoRepository;
    private final AuthTokenService authTokenService;
    private final PasswordEncoder passwordEncoder;


    // ✅ 이메일 중복 검사
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email){
        return userRepository.existsByEmail(email);
    }

    // ✅ 일반 회원가입
    // 이메일 중복 체크 -> 비밀번호 암호화 -> 사용자 정보 저장
    @Transactional
    public User register(UserSignUpRequestDto dto){
        if (userRepository.findByEmail(dto.getEmail()).isPresent()){
            throw new CustomException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // 병원 정보 확인
        VetInfo vetInfo = vetInfoRepository.findById(dto.getVetInfoId())
                .orElseThrow(() -> new CustomException(ErrorCode.VET_NOT_FOUND));

        // 암호화
        String encodedPassword = passwordEncoder.encode(dto.getPassword());
        // 유저 생성
        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(encodedPassword)
                .role(dto.getRole())
                .phoneNumber(dto.getPhoneNumber())
                .emergencyContact(dto.getEmergencyContact())
                .vetInfo(vetInfo)
                .build();

        // 의료진인 경우 상태 설정
        if (dto.getRole() == UserRole.ROLE_STAFF) {
            user.updateStatus(UserStatus.ON_DUTY);
        }

        return userRepository.save(user);
    }

    //TODO: 비밀번호 확인 기능

    // ✅ 일반 로그인
    @Transactional
    public UserResponseDto login(LoginRequestDto loginDto){

        // 사용자 조회(email)
        User user = userRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(()-> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 비밀번호 확인
        boolean isMatch = passwordEncoder.matches(loginDto.getPassword(), user.getPassword());

        if (!isMatch) {
            throw new CustomException(ErrorCode.PASSWORD_MISMATCH);
        }

        // refreshToken 생성
        String refreshToken = authTokenService.generateRefreshToken(user);

        // refreshToken 저장
        user.updateRefreshToken(refreshToken);
        userRepository.save(user);


        return UserResponseDto.fromEntity(user);
    }

    // ✅ 엑세스 토큰 생성
    public String genAccessToken(User user){
        return authTokenService.genAccessToken(user);
    }

    // ✅ 로그아웃
    @Transactional
    public void logout(String accessToken) {
        // accessToken 받아서 유저 조회
        User tokenUser = getUserByAccessToken(accessToken);
        try {
            User user = userRepository.findById(tokenUser.getId())
                    .orElseThrow(()-> new CustomException(ErrorCode.USER_NOT_FOUND));
            user.updateRefreshToken(null);
            userRepository.save(user);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.LOGOUT_FAILED);
        }
    }

    // ✅ 회원 탈퇴
    @Transactional
    public void deleteUser(long userId) {
        userRepository.deleteById(userId);
    }

    // 📍 조회
    // ✅ 이메일로 사용자 조회
    @Transactional(readOnly = true)
    public User getUserByEmail(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(()-> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    // ✅ 엑세스 토큰으로 사용자 조회
    public User getUserByAccessToken(String accessToken){
        Map<String, Object> payload = authTokenService.payload(accessToken);

        if(payload == null) return null;

        Number idNum = (Number) payload.get("id");

        long id = idNum.longValue();
        String name = (String) payload.get("name");
        String email = (String) payload.get("email");
        String roleString = (String) payload.get("role");
        UserRole role = UserRole.valueOf(roleString);

        if (roleString == null) {
            throw new IllegalArgumentException("Role is missing in token payload");
        }

        return User.builder()
                .id(id)
                .name(name)
                .email(email)
                .role(role)
                .build();
    }

    // ✅ 리프레시 토큰으로 사용자 조회
    public Optional<User> findByRefreshToken(String refreshToken){
        return userRepository.findByRefreshToken(refreshToken);
    }

    // ✅ ID로 사용자 조회
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    // ✅ 의료진 조회
    @Transactional(readOnly = true)
    public List<StaffResponseDto> getStaffList(boolean onlyAvailable) {
        List<User> staffList;

        if (onlyAvailable) {
            // 근무 중인 의료진만 조회
            staffList = userRepository.findByRoleAndStatus(UserRole.ROLE_STAFF, UserStatus.ON_DUTY);
        } else {
            // 모든 의료진 조회
            staffList = userRepository.findByRole(UserRole.ROLE_STAFF);
        }

        return staffList.stream()
                .map(StaffResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

}
