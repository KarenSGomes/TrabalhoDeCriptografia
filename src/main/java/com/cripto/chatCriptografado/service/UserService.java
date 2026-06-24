package com.cripto.chatCriptografado.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cripto.chatCriptografado.entity.Chat;
import com.cripto.chatCriptografado.entity.User;
import com.cripto.chatCriptografado.dto.ChatDTO.ChatResponseDTO;
import com.cripto.chatCriptografado.dto.MessageDTO.MsgResponseDTO;
import com.cripto.chatCriptografado.dto.UserDTO.UserLoginDTO;
import com.cripto.chatCriptografado.dto.UserDTO.UserRequestDTO;
import com.cripto.chatCriptografado.dto.UserDTO.UserResponseDTO;
import com.cripto.chatCriptografado.repository.UserRepository;
import com.cripto.chatCriptografado.repository.ChatRepository; // <-- Import adicionado
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    @Autowired
    private ChatRepository chatRepository;

    private final UserRepository repository;
    private final PasswordEncoder passEncoder;

    @Transactional
    public UserResponseDTO save(UserRequestDTO dto) {
        if (repository.existsByEmail(dto.email())) {
            throw new RuntimeException("Já existe um usuário com esse email.");
        }

        User user = new User();

        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setPassword(passEncoder.encode(dto.password()));
        user.setPublicKey(dto.publicKey());

        User savedUser = repository.save(user);

        return toResponseDTO(savedUser);
    }

    public UserResponseDTO findById(String id) {
        User user = repository.findById(id).orElseThrow(
                () -> new RuntimeException("Usuário não encontrado.")
        );

        return toResponseDTO(user);
    }

    public UserResponseDTO findByEmail(String email) {
        User user = repository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Usuário não encontrado.")
        );

        return toResponseDTO(user);
    }

    @Transactional(readOnly = true)
    public List<ChatResponseDTO> getUserChats(String userId) {
        return chatRepository.findByUser1IdOrUser2Id(userId, userId)
        .stream().map(chat -> toResponseDTO(chat)).collect(Collectors.toList());
    }

    public List<UserResponseDTO> getAllUsers() {
        return repository.findAll().stream().map(user -> toResponseDTO(user)).collect(Collectors.toList());
    } 

    public void delete(String id) {
        repository.deleteById(id);
    }

    public String login(UserLoginDTO dto) {
        User user = repository.findByEmail(dto.email()).orElseThrow(
                () -> new RuntimeException("Email ou senha incorretos")
        );

        boolean equalPass = passEncoder.matches(dto.password(), user.getPassword());

        if (!equalPass) {
            throw new RuntimeException("Email ou senha incorretos");
        }

        return user.getId();
    }

    private UserResponseDTO toResponseDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPublicKey()
        );
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
                chat.getUser1Id(),          // <-- NOVO
                chat.getUser2Id(),          // <-- NOVO
                chat.getAesKeyForUser1(),   // <-- NOVO
                chat.getAesKeyForUser2(),   // <-- NOVO
                users,
                messages
        );
    }
}