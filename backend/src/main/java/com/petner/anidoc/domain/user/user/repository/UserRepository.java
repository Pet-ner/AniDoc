package com.petner.anidoc.domain.user.user.repository;

import com.petner.anidoc.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
