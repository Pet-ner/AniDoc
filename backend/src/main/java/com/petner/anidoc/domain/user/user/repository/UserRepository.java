package com.petner.anidoc.domain.user.user.repository;

import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.user.user.entity.UserRole;
import com.petner.anidoc.domain.user.user.entity.UserStatus;
import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
//    Optional<User> findByRefreshToken(String refreshToken);

    //변경 3개 결과 중 가장 최근 것 1개만 선택(3개결과가 나와서 오류발생)
    @Query("SELECT u FROM User u WHERE u.refreshToken = :refreshToken ORDER BY u.updatedAt DESC")
    Optional<User> findByRefreshToken(@Param("refreshToken") String refreshToken);
    boolean existsByEmail(String email);
    List<User> findByRole(UserRole userRole);
    // 사용자 역할, 상태별 조회
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = :status")
    List<User> findByRoleAndStatus(@Param("role") UserRole role, @Param("status") UserStatus status);


    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.name = :name, u.phoneNumber = :phoneNumber, " +
            "u.emergencyContact = :emergencyContact," +
            "u.role = :role, " +
            " u.vetInfo = :vetInfo, u.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE u.id = :id")
    void updateUserBasicInfo(@Param("id") Long id,
                             @Param("name") String name,
                             @Param("phoneNumber") String phoneNumber,
                             @Param("emergencyContact") String emergencyContact,
                             @Param("role") UserRole role,
                             @Param("vetInfo") VetInfo vetInfo);
}


