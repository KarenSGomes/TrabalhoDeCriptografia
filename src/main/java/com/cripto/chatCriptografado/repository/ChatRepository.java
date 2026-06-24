package com.cripto.chatCriptografado.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cripto.chatCriptografado.entity.Chat;

public interface ChatRepository extends JpaRepository<Chat, String> {
    Optional<Chat> findByUser1IdAndUser2Id(String user1Id, String user2Id);
    List<Chat> findByUser1IdOrUser2Id(String user1Id, String user2Id);
}