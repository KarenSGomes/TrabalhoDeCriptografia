package com.cripto.chatCriptografado.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cripto.chatCriptografado.entities.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> getAllByChatId(String chatId); 
}
