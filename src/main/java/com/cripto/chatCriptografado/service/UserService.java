package com.cripto.chatCriptografado.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cripto.chatCriptografado.entity.Chat;
import com.cripto.chatCriptografado.entity.User;
import com.cripto.chatCriptografado.dto.UserDTO.UserLoginDTO;
import com.cripto.chatCriptografado.dto.UserDTO.UserRequestDTO;
import com.cripto.chatCriptografado.dto.UserDTO.UserResponseDTO;
import com.cripto.chatCriptografado.repository.UserRepository;
import com.cripto.chatCriptografado.repository.ChatRepository; // <-- Import adicionado

import jakarta.transaction.Transactional;
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

    // ✅ CORREÇÃO: Transformamos a sua busca em um método funcional
    public List<Chat> getUserChats(String userId) {
        return chatRepository.findByUser1IdOrUser2Id(userId, userId);
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
}