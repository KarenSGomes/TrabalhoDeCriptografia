package com.cripto.chatCriptografado.dto.MessageDTO;

public record MsgRequestDTO(
    String userId,
    String chatId,
    String cipherText,
    String baseIv
) {}
