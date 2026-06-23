package com.cripto.chatCriptografado.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.cripto.chatCriptografado.dto.ChatDTO.ChatRequestDTO;
import com.cripto.chatCriptografado.dto.ChatDTO.ChatResponseDTO;
import com.cripto.chatCriptografado.entity.Chat;
import com.cripto.chatCriptografado.entity.User;
import com.cripto.chatCriptografado.repository.ChatRepository;
import com.cripto.chatCriptografado.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository repository;
    private final UserRepository userRepository;

    public ChatResponseDTO create(ChatRequestDTO dto) {
        User user = userRepository.findById(dto.userId()).orElseThrow(
            () -> new RuntimeException("Usuário não cadastrado.")
        );

        List<User> userList = new ArrayList<>();
        userList.add(user);

        Chat chat = new Chat();

        chat.setUsers(userList);

        return toResponseDTO(repository.save(chat));
    }

    public ChatResponseDTO findById(String chatId) {
        Chat chat = repository.findById(chatId).orElseThrow(
            () -> new RuntimeException("Chat não encontrado")
        );

        return toResponseDTO(chat);
    }

    @Transactional
    public ChatResponseDTO addUserToChat(String chatId, String userId) {
        Chat chat = repository.findById(chatId).orElseThrow(
            () -> new RuntimeException("Chat não encontrado")
        );

        User user = userRepository.findById(userId).orElseThrow(
            () -> new RuntimeException("Usuário não encontrado")
        );

        if (!chat.getUsers().contains(user)) {
            chat.getUsers().add(user);
        }

        return toResponseDTO(chat);
    }

    @Transactional
    public ChatResponseDTO removeUserFromChat(String chatId, String userId) {
        Chat chat = repository.findById(chatId).orElseThrow(
            () -> new RuntimeException("Chat não encontrado")
        );

        chat.getUsers().removeIf(u -> u.getId().equals(userId));

        return toResponseDTO(chat);
    }

    public void deleteChat(String chatId) {
        if (!repository.existsById(chatId)) {
            throw new RuntimeException("Chat não encontrado");
        }

        repository.deleteById(chatId);
    }

    private ChatResponseDTO toResponseDTO(Chat chat) {
        return new ChatResponseDTO(
            chat.getId(),
            chat.getUsers(),
            chat.getMessages()
        );
    }
}
