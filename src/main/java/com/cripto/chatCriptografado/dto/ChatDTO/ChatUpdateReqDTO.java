package com.cripto.chatCriptografado.dto.ChatDTO;

public record ChatUpdateReqDTO(
    String aesKeyForUser1,
    String aesKeyForUser2
) {}
