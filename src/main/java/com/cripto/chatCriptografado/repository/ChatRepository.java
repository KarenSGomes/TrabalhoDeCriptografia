package com.cripto.chatCriptografado.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cripto.chatCriptografado.entity.Chat;

public interface ChatRepository extends JpaRepository<Chat, String> {
    
}
