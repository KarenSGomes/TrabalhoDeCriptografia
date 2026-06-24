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

        Chat chat = chatRepository.findById(dto.chatId())
            .orElseThrow(() -> new RuntimeException("Chat não encontrado"));

        User user = userRepository.findById(dto.userId())
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!chat.getUser1().getId().equals(user.getId()) &&
            !chat.getUser2().getId().equals(user.getId())) {
            throw new RuntimeException("Usuário não pertence ao chat");
        }

        Message message = new Message();
        message.setChat(chat);
        message.setUser(user);
        message.setEncryptedMessage(dto.cipherText());
        message.setIv(dto.iv());

        Message saved = messageRepository.save(message);

        return toResponseDTO(saved);
    }

    private MsgResponseDTO toResponseDTO(Message msg) {
        return new MsgResponseDTO(
            msg.getId(),
            msg.getUser().getId(),
            msg.getChat().getId(),
            msg.getEncryptedMessage(),
            msg.getIv(),
            msg.getCreatedAt()
        );
    }
}
