package com.cripto.chatCriptografado.dto.UserDTO;

public record UserResponseDTO(
    String id,
    String username,
    String email,
    String publicKey
) {}