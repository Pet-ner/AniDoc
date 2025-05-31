package com.petner.anidoc.domain.user.user.entity;

import com.petner.anidoc.domain.user.notification.entity.Notification;
import com.petner.anidoc.domain.user.pet.entity.Pet;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import com.petner.anidoc.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.DynamicUpdate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString(exclude = "password")
@Table(name = "users")
@DynamicUpdate
public class User extends BaseEntity implements UserDetails {


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vet_id")
    private VetInfo vetInfo;

    @Column(nullable = false, length = 100, unique = true)
    private String email;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(name = "phone_number", nullable = false, length = 50)
    private String phoneNumber;

    @Column(name = "emergency_contact")
    private String emergencyContact;

    @Column(nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private UserStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name ="approval_status")
    private ApprovalStatus approvalStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "sso_provider")
    private SsoProvider ssoProvider;

    @Column(name = "social_id")
    private String socialId;

    @Column(name = "refresh_token", unique = true)
    private String refreshToken;


    @Builder.Default
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    private List<Pet> pets = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Notification> notifications = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Reservation> reservations = new ArrayList<>();

    public boolean isAdmin() {
        return UserRole.ROLE_ADMIN.equals(this.role);
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        //기본 사용자 권한
        authorities.add(new SimpleGrantedAuthority(this.role.toString()));

        //관리자인 경우 추가 권한
        if (isAdmin()) {
            authorities.add(new SimpleGrantedAuthority(UserRole.ROLE_ADMIN.toString()));
        }

        return authorities;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired(){
        return true;
    }

    @Override
    public boolean isAccountNonLocked(){
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired(){
        return true;
    }

    @Override
    public boolean isEnabled(){
        return true;
    }

    //refreshToken 발급
    public void updateRefreshToken(String refreshToken){
        this.refreshToken = refreshToken;
    }


    public void updateStatus(UserStatus status) {
        this.status = status;
    }
}
