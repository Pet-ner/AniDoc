package com.petner.anidoc.global.security;

import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.user.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * ✅ CustomUserDetailService
 *  - Spring Security가 사용자 인증 시 호출하는 서비스
 *  - 이메일을 기준으로 DB에서 사용자를 찾아 UserDetails 객체로 반환
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * ✅ Spring Security의 인증 과정에서 호출됨
     *  - email을 기준으로 사용자 정보를 조회함
     *  - 존재하지 않을 경우 예외 발생
     */
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .map(this::createUserDetails)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

    }

    // ✅ User -> UserDetails 변환
    private UserDetails createUserDetails(User user) {
        return new SecurityUser(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getAuthorities()
        );
    }
}
