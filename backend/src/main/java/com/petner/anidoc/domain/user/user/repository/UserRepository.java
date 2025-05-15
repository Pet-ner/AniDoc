package com.petner.anidoc.domain.user.user.repository;

import com.petner.anidoc.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import com.petner.anidoc.domain.user.user.entity.User;

import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByRefreshToken(String refreshToken);
    boolean existsByEmail(String email);


}
