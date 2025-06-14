package com.petner.anidoc.domain.user.user.service;

import com.petner.anidoc.domain.user.user.dto.*;
import com.petner.anidoc.domain.user.user.entity.*;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import com.petner.anidoc.domain.vet.vet.repository.VetInfoRepository;
import com.petner.anidoc.global.exception.CustomException;
import com.petner.anidoc.global.exception.ErrorCode;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
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
    private final UserStatusService userStatusService;


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
            user.updateStatus(UserStatus.OFFLINE);
            user.setApprovalStatus(ApprovalStatus.PENDING);
        }

        return userRepository.save(user);
    }

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

        userStatusService.checkLoginUser(user);

        // refreshToken 생성
        String refreshToken = authTokenService.generateRefreshToken(user);

        // refreshToken 저장
        user.updateRefreshToken(refreshToken);
        userRepository.save(user);

        return UserResponseDto.fromEntity(user);
    }

    // 소셜 로그인
    @Transactional
    public User authenticateUserByToken(String accessToken) {
        // 토큰 검증
        Map<String, Object> payload = authTokenService.payload(accessToken);
        if (payload == null) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        // 사용자 ID 추출
        Long userId = ((Number) payload.get("id")).longValue();

        // DB에서 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 로그인 상태 확인 및 설정
        userStatusService.checkLoginUser(user);

        return user;
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
            user.setStatus(UserStatus.OFFLINE);
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

    public Optional<User> findByEmail(String email){
        return userRepository.findByEmail(email);
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
            // 승인되고 근무 중인 의료진만 조회
            List<UserStatus> statuses = Arrays.asList(
                    UserStatus.ON_DUTY,
                    UserStatus.OFFLINE
            );

            staffList = userRepository.findByRoleAndApprovalStatusAndStatusIn(
                    UserRole.ROLE_STAFF,
                    ApprovalStatus.APPROVED,
                    statuses
            );
        } else {
            // 승인된 모든 의료진 조회
            staffList = userRepository.findByRoleAndApprovalStatus(
                    UserRole.ROLE_STAFF,
                    ApprovalStatus.APPROVED
            );
        }


        return staffList.stream()
                .map(StaffResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public void modify(User user, @NotBlank String email){

        user.setEmail(email);
    }

    public User join(String email, String socialId, SsoProvider provider){
        userRepository
                .findByEmail(email)
                .ifPresent(user -> {
                    throw new RuntimeException("해당 email은 이미 사용중입니다.");
                });


        User user = User.builder()
                .name("Temp_name")
                .email(email)
                .password("SOCIALPASSWORD")
                .phoneNumber("test")
                .socialId(socialId)
                .ssoProvider(provider)
                .role(UserRole.ROLE_USER)
                .build();
        return userRepository.save(user);
    }

    public User modifyOrJoin(String email, String socialId, SsoProvider provider) {
        Optional<User> opUser = findByEmail(email);

        if (opUser.isPresent()) {
            User user = opUser.get();
            modify(user, email);
            return user;
        }
        return join(email,socialId,provider);
    }


    @Transactional
    public User updateuser(Long userId, UserUpdateResponseDto dto){
        // userId로 User 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // password가 null이거나 비어있으면 기존 비밀번호 유지

        String password = dto.getPassword();
        if (password != null && !password.isEmpty()) {
            // 비밀번호 해싱 후 저장
            user.setPassword(passwordEncoder.encode(password));
        }

        user.setPhoneNumber(dto.getPhoneNumber());
        user.setEmergencyContact(dto.getEmergencyContact());

        return user;
    }


    @Transactional
    public User updateSocialUser(Long userId, SocialSignUpRequestDto updateDto) {
        // userId로 User 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // VetInfo 조회
        VetInfo vetInfo = null;
        if (updateDto.getVetInfo() != null) {
            vetInfo = vetInfoRepository.findById(updateDto.getVetInfo().getId())
                    .orElseThrow(() -> new RuntimeException("병원 정보를 찾을 수 없습니다."));
        }

        // 기본 정보 업데이트
        user.updateBasicInfo(
                updateDto.getName(),
                updateDto.getPhoneNumber(),
                updateDto.getEmergencyContact(),
                updateDto.getRole(),
                vetInfo
        );

        // 의료진일 경우 상태 및 승인 설정
        if (updateDto.getRole() == UserRole.ROLE_STAFF) {
            user.updateStatus(UserStatus.OFFLINE);
            user.setApprovalStatus(ApprovalStatus.PENDING);
        }

        return user;
    }



    // 비밀번호 체크
    @Transactional
    public boolean verifyCurrentPassword(User user, String inputPassword) {

        // 소셜 로그인 사용자는 비밀번호 확인 불가
        if (user.getSocialId() != null) {
            throw new RuntimeException("소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.");
        }

        // 현재 비밀번호와 입력된 비밀번호 비교
        return passwordEncoder.matches(inputPassword, user.getPassword());
    }




    // 📍 status 관련 service

    // 내 상태 변경
    @Transactional
    public void updateMyStatus(Long id, UserStatus newStatus){
        User user = userRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("사용자 없음"));
        user.setStatus(newStatus);
        userRepository.save(user);
    }


    // 내 상태 조회
    @Transactional
    public UserStatus getStatus(Long id) {
        return userRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("사용자를 찾을 수 없습니다."))
                .getStatus();

    }

}
