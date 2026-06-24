package com.cripto.chatCriptografado.dto.MessageDTO;

import java.time.LocalDateTime;

public record MsgResponseDTO(
    Long id,
    String userId,
    String chatId,
    String cipherText,
    String iv,
    LocalDateTime createdAt
) {}