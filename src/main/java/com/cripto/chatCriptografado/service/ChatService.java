package com.cripto.chatCriptografado.service;

import java.util.List;
import java.util.Optional;

import com.cripto.chatCriptografado.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public ChatResponseDTO create(ChatRequestDTO dto) {

        String user1Id = dto.user1Id();
        String user2Id = dto.user2Id();

        // garante ordem fixa (evita duplicação A-B / B-A)
        if (user1Id.compareTo(user2Id) > 0) {
            String temp = user1Id;
            user1Id = user2Id;
            user2Id = temp;
        }

        // ✅ MUDANÇA 1: Guardamos os usuários encontrados em variáveis
        User u1 = userRepository.findById(user1Id).orElseThrow(
                () -> new RuntimeException("Usuário 1 não encontrado")
        );

        User u2 = userRepository.findById(user2Id).orElseThrow(
                () -> new RuntimeException("Usuário 2 não encontrado")
        );

        Optional<Chat> existing = repository.findByUser1IdAndUser2Id(user1Id, user2Id);
        if (existing.isPresent()) {
            return toResponseDTO(existing.get());
        }

        Chat chat = new Chat();
        chat.setUser1Id(user1Id);
        chat.setUser2Id(user2Id);

        // ✅ MUDANÇA 2: Preenchemos os objetos em memória para evitar o NullPointerException!
        chat.setUser1(u1);
        chat.setUser2(u2);

        return toResponseDTO(repository.save(chat));
    }

    @Transactional(readOnly = true)
    public ChatResponseDTO findById(String chatId) {
        Chat chat = repository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat não encontrado"));

        return toResponseDTO(chat);
    }

    @Transactional
    public void updateKeys(String id, String aesKeyForUser1, String aesKeyForUser2) {
        repository.updateKeys(id, aesKeyForUser1, aesKeyForUser2);
    }

    @Transactional
    public void deleteChat(String chatId) {
        if (!repository.existsById(chatId)) {
            throw new RuntimeException("Chat não encontrado");
        }

        repository.deleteById(chatId);
    }

    @Transactional(readOnly = true)
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

        // 1. Prevenção de NullPointerException para o User 1
        User user1 = chat.getUser1();
        if (user1 == null) {
            user1 = userRepository.findById(chat.getUser1Id())
                    .orElseThrow(() -> new RuntimeException("User1 não encontrado"));
        }

        // 2. Prevenção de NullPointerException para o User 2
        User user2 = chat.getUser2();
        if (user2 == null) {
            user2 = userRepository.findById(chat.getUser2Id())
                    .orElseThrow(() -> new RuntimeException("User2 não encontrado"));
        }

        List<UserResponseDTO> users = List.of(
                new UserResponseDTO(
                        user1.getId(),
                        user1.getUsername(),
                        user1.getEmail(),
                        user1.getPublicKey()
                ),
                new UserResponseDTO(
                        user2.getId(),
                        user2.getUsername(),
                        user2.getEmail(),
                        user2.getPublicKey()
                )
        );

        // 3. Prevenção de NullPointerException para a lista de mensagens
        List<MsgResponseDTO> messages = new java.util.ArrayList<>();
        if (chat.getMessages() != null) {
            messages = chat.getMessages().stream()
                    .map(m -> new MsgResponseDTO(
                            m.getId(),
                            m.getUser().getId(),
                            chat.getId(),
                            m.getEncryptedMessage(),
                            m.getIv(),
                            m.getCreatedAt()
                    ))
                    .toList();
        }

        return new ChatResponseDTO(
                chat.getId(),
                chat.getUser1Id(),          // <-- NOVO
                chat.getUser2Id(),          // <-- NOVO
                chat.getAesKeyForUser1(),   // <-- NOVO
                chat.getAesKeyForUser2(),   // <-- NOVO
                users,
                messages
        );
    }
}