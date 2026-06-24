package com.cripto.chatCriptografado.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cripto.chatCriptografado.entity.Chat;

import jakarta.transaction.Transactional;

public interface ChatRepository extends JpaRepository<Chat, String> {
    @Modifying
    @Transactional
    @Query(""" 
        UPDATE Chat c 
        SET c.aesKeyForUser1 = :k1, 
            c.aesKeyForUser2 = :k2 
        WHERE c.id = :chatId 
    """)
    void updateKeys(@Param("chatId") String chatId, @Param("k1") String k1, @Param("k2") String k2);
    
    Optional<Chat> findByUser1IdAndUser2Id(String user1Id, String user2Id);
    List<Chat> findByUser1IdOrUser2Id(String user1Id, String user2Id);
}