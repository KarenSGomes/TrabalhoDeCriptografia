package com.cripto.chatCriptografado.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.cripto.chatCriptografado.dto.ChatDTO.ChatRequestDTO;
import com.cripto.chatCriptografado.dto.ChatDTO.ChatResponseDTO;
import com.cripto.chatCriptografado.dto.MessageDTO.MsgResponseDTO;
import com.cripto.chatCriptografado.dto.UserDTO.UserResponseDTO;
import com.cripto.chatCriptografado.entity.Chat;
import com.cripto.chatCriptografado.repository.ChatRepository;
import com.cripto.chatCriptografado.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository repository;
    private final UserRepository userRepository;

    public ChatResponseDTO create(ChatRequestDTO dto) {

        String user1Id = dto.user1Id();
        String user2Id = dto.user2Id();

        // garante ordem fixa (evita duplicação A-B / B-A)
        if (user1Id.compareTo(user2Id) > 0) {
            String temp = user1Id;
            user1Id = user2Id;
            user2Id = temp;
        }

        userRepository.findById(user1Id).orElseThrow(
            () -> new RuntimeException("Usuário 1 não encontrado")
        );

        userRepository.findById(user2Id).orElseThrow(
            () -> new RuntimeException("Usuário 2 não encontrado")
        );

        Optional<Chat> existing = repository.findByUser1IdAndUser2Id(user1Id, user2Id);
        if (existing.isPresent()) {
            return toResponseDTO(existing.get());
        }

        Chat chat = new Chat();
        chat.setUser1Id(user1Id);
        chat.setUser2Id(user2Id);

        return toResponseDTO(repository.save(chat));
    }

    public ChatResponseDTO findById(String chatId) {
        Chat chat = repository.findById(chatId)
            .orElseThrow(() -> new RuntimeException("Chat não encontrado"));

        return toResponseDTO(chat);
    }
    
    public void updateKeys(String id, String aesKeyForUser1, String aesKeyForUser2) {
        repository.updateKeys(id, aesKeyForUser1, aesKeyForUser2);
    }

    public void deleteChat(String chatId) {
        if (!repository.existsById(chatId)) {
            throw new RuntimeException("Chat não encontrado");
        }

        repository.deleteById(chatId);
    }

    public ChatResponseDTO findBetween(String user1Id, String user2Id) {
        // garante ordem fixa (evita A-B vs B-A)
        if (user1Id.compareTo(user2Id) > 0) {
            String temp = user1Id;
            user1Id = user2Id;
            user2Id = temp;
        }

        Chat chat = repository.findByUser1IdAndUser2Id(user1Id, user2Id)
            .orElseThrow(() -> new RuntimeException("Chat não encontrado"));

        return toResponseDTO(chat);
    }

    private ChatResponseDTO toResponseDTO(Chat chat) {

        List<UserResponseDTO> users = List.of(
            new UserResponseDTO(
                chat.getUser1().getId(),
                chat.getUser1().getUsername(),
                chat.getUser1().getEmail(),
                chat.getUser1().getPublicKey()
            ),
            new UserResponseDTO(
                chat.getUser2().getId(),
                chat.getUser2().getUsername(),
                chat.getUser2().getEmail(),
                chat.getUser2().getPublicKey()
            )
        );

        List<MsgResponseDTO> messages = chat.getMessages()
            .stream()
            .map(m -> new MsgResponseDTO(
                m.getId(),
                m.getUser().getId(),
                chat.getId(),
                m.getEncryptedMessage(),
                m.getIv(),
                m.getCreatedAt()
            ))
            .toList();

        return new ChatResponseDTO(
            chat.getId(),
            users,
            messages
        );
    }
}
