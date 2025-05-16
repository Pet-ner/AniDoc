package com.petner.anidoc.domain.chat.chatroom.repository;

import com.petner.anidoc.domain.chat.chatroom.entity.ChatRoom;
import com.petner.anidoc.domain.user.user.entity.User;
import com.petner.anidoc.domain.vet.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByReservation(Reservation reservation);

    List<ChatRoom> findByUserOrderByCreatedAtDesc(User user);

    List<ChatRoom> findByAdminOrderByCreatedAtDesc(User admin);

    @Query("SELECT cr FROM ChatRoom cr WHERE cr.user.id = :userId OR cr.admin.id = :userId ORDER BY cr.createdAt DESC")
    List<ChatRoom> findAllByUserId(@Param("userId") Long userId);
}
