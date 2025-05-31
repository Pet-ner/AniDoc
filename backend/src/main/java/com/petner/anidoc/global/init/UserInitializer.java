package com.petner.anidoc.global.init;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.entity.UserStatus;
import com.petner.anidoc.domain.user.user.repository.UserRepository;
import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import com.petner.anidoc.domain.vet.vet.repository.VetInfoRepository;
import com.petner.anidoc.global.exception.CustomException;
import com.petner.anidoc.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VetInfoRepository vetInfoRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String password = passwordEncoder.encode("Qwer1234");
        VetInfo vetInfo = vetInfoRepository.findByVetNumber("010-2238-7856")
                .orElseThrow(() -> new CustomException(ErrorCode.VET_NOT_FOUND));
        createUser("관리자", "admin@happy.com", password, "010-2451-8553", "010-4132-6345", UserRole.ROLE_ADMIN, vetInfo);
        createUser("이진호", "jhlee@happy.com", password, "010-4532-2279", "010-6852-3225", UserRole.ROLE_STAFF, vetInfo);
    }

    private void createUser(String name, String email, String password, String phoneNumber, String emergencyContact, UserRole role, VetInfo vetInfo) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .password(password)
                    .role(role)
                    .phoneNumber(phoneNumber)
                    .emergencyContact(emergencyContact)
                    .vetInfo(vetInfo)
                    .build();

            if (role == UserRole.ROLE_STAFF) {
                user.updateStatus(UserStatus.ON_DUTY);
            }

            userRepository.save(user);
        }
    }
}