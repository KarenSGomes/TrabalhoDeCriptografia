package com.cripto.chatCriptografado.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cripto.chatCriptografado.dto.MessageDTO.*;
import com.cripto.chatCriptografado.entity.Chat;
import com.cripto.chatCriptografado.entity.Message;
import com.cripto.chatCriptografado.entity.User;
import com.cripto.chatCriptografado.repository.ChatRepository;
import com.cripto.chatCriptografado.repository.MessageRepository;
import com.cripto.chatCriptografado.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;

    @Transactional
    public MsgResponseDTO save(MsgRequestDTO dto) {

        Chat chat = chatRepository.findById(dto.chatId()).orElseThrow(
            () -> new RuntimeException("Chat não encontrado")
        );

        User user = userRepository.findById(dto.userId()).orElseThrow(
            () -> new RuntimeException("Usuário não encontrado")
        );

        Message message = new Message();

        message.setChat(chat);
        message.setUser(user);
        message.setCipherText(dto.cipherText());
        message.setBaseIv(dto.baseIv());

        Message saved = messageRepository.save(message);

        return toResponseDTO(saved);
    }

    private MsgResponseDTO toResponseDTO(Message msg) {
        return new MsgResponseDTO(
            msg.getId(),
            msg.getChat().getId(),
            msg.getUser().getId(),
            msg.getCipherText(),
            msg.getBaseIv(),
            msg.getCreatedAt()
        );
    }
}
